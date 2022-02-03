let posList = [
  [1,1],
  [2,1],
  [3,1],
  [1,2],
  [2,2],
  [2,3],
  [3,1],
  [3,2],
  [3,3],
];

function assignSpatialPos(participant) {
  for (let i = 0; i < videoContainerList.length; i++) {
    if (!videoContainerList[i].participantId) {
      videoContainerList[i].participantId = participant.id;
      pos = posList[i]
      break;
    }
  }
sp_pos = {x: pos[0] * window.innerWidth / 3, y: pos[1] * window.innerHeight/3, z:0}
console.log(participant.id)
console.log(sp_pos)
VoxeetSDK.conference.setSpatialPosition(VoxeetSDK.session.participant, sp_pos);

};

const initUI = () => {
    const joinButton = document.getElementById('join-btn');
    const conferenceNameInput = document.getElementById('alias-input');
    const conferenceNameInputPrompt = document.getElementById('btnGroupAddon');
    const leaveButton = document.getElementById('leave-btn');
    const nameMessage = document.getElementById('name-message');
    nameMessage.innerHTML = `You are logged in as ${randomName}`;
    const startVideoBtn = document.getElementById('start-video-btn');
    const stopVideoBtn = document.getElementById('stop-video-btn');
    const muteAudioBtn = document.getElementById('mute-audio-btn');
    const UnmuteAudioBtn = document.getElementById('unmute-audio-btn');
    const cameraPrompt = document.getElementById('camera-msg');
    const cameraIconContainer = document.getElementById('camera-icon-container');
    const copyJoinLink = document.getElementById('copy-join-link');
    const copyJoinLinkMsg = document.getElementById('copy-join-link-msg');

    
  
    // handle conference name if present in url
    let conferenceUrl = getConferenceNameFromURL();
    setConferenceName(
      conferenceUrl,
      conferenceNameInput,
      conferenceNameInputPrompt
    );
  
    // as user types conference name, append alias to url as query string param
    conferenceNameInput.addEventListener('keyup', function (event) {
      updateConferenceName(event);
    });
  
    joinButton.onclick = () => {
        let participant = VoxeetSDK.conference.participants
        let conferenceName = getConferenceNameFromURL()
          ? getConferenceNameFromURL()
          : conferenceNameInput.value;
        VoxeetSDK.conference
          .create({ alias: conferenceName, params: { dolbyVoice: true } })
          .then((conference) =>
            VoxeetSDK.conference.join(conference, {
              constraints: { audio: true, video: false }, preferRecvMono: false,  spatialAudio: true,
            })
          ).then(() => {
            handleControlBtnsOnJoinCall();
            const forward = { x: 0, y: -1, z: 0 };
            const up  = { x: 0, y: 0, z: 1 };
            const right  = { x: 1, y: 0, z: 0 };
            const scale = { x: window.innerWidth / 4, y: window.innerHeight / 3, z: 1 };
            VoxeetSDK.conference.setSpatialEnvironment(scale, forward, up, right);


          })
          .catch((e) => console.log('Something wrong happened : ' + e));
      };
    
      leaveButton.onclick = () => {
        VoxeetSDK.conference
          .leave()
          .then(() => {
            handleControlBtnsOnLeaveCall();
          })
          .catch((err) => {
            console.log(err);
          });
      };
  
    leaveButton.onclick = () => {
      VoxeetSDK.conference
        .leave()
        .then(() => {
          handleControlBtnsOnLeaveCall();
        })
        .catch((err) => {
          console.log(err);
        });
    };











































  
    startVideoBtn.onclick = () => {
      VoxeetSDK.conference.startVideo(VoxeetSDK.session.participant).then(() => {
        stopVideoBtn.style.display = 'none';
        startVideoBtn.style.display = 'block';
        cameraPrompt.innerText = 'Camera On';
      });
      // once the video has started, check evey 5 milliseconds which of the participants is actively speaking
  
      setInterval(() => {
        let participants = VoxeetSDK.conference.participants;
        for (let participant of participants) {
          VoxeetSDK.conference.isSpeaking(
            VoxeetSDK.conference.participants.get(participant[0]),
            (isSpeaking) => {
              if (isSpeaking) {
                console.log(
                  'The participant',
                  participant[0],
                  'speaking status:',
                  isSpeaking
                );
                // find that participant in the user grid and set their isSpeaking to true
                for (let i = 0; i < videoContainerList.length; i++) {
                  if (videoContainerList[i].participantId === participant[0]) {
                    let cell = document.getElementById(`video-container-${i}`);
                    cell.style.outline = '5px solid lightgreen';
                  }
                }
              } else if (!isSpeaking) {
                for (let i = 0; i < videoContainerList.length; i++) {
                  if (videoContainerList[i].participantId === participant[0]) {
                    let cell = document.getElementById(`video-container-${i}`);
                    cell.style.outline = '0px solid black';
                  }
                }
              }
            }
          );
        }
      }, 500);
    };
  
    stopVideoBtn.onclick = () => {
      VoxeetSDK.conference.stopVideo(VoxeetSDK.session.participant).then(() => {
        cameraPrompt.innerText = 'Camera Off';
      });
    };

    muteAudioBtn.onclick = () => {
      try {
        VoxeetSDK.conference.mute(VoxeetSDK.session.participant, true);
        document.getElementById('btn-unmute').classList.remove('d-none');
        document.getElementById('btn-mute').classList.add('d-none');
      } catch (error) {
        console.error(error);
      }
    };

    UnmuteAudioBtn.onclick = () => {
      try {
        VoxeetSDK.conference.mute(VoxeetSDK.session.participant, false);

        document.getElementById('btn-unmute').classList.add('d-none');
        document.getElementById('btn-mute').classList.remove('d-none');
      } catch (error) {
        console.error(error);
      }
    };
  
    cameraIconContainer.onmouseenter = () => {
      handleVideoBtnMouseEnter();
    };
  
    cameraIconContainer.onmouseleave = () => {
      handleVideoBtnMouseLeave();
    };
  
    copyJoinLink.onclick = () => {
      handleCopyJoinLink();
    };
  
    // UI HELPERS /////////////////////////
  
    const handleCopyJoinLink = () => {
      let conferenceUrl = window.location.href;
      navigator.clipboard.writeText(conferenceUrl).then(
        function () {
          console.log('Copying to clipboard was successful!');
        },
        function (err) {
          console.error('Could not copy text: ', err);
        }
      );
      copyJoinLinkMsg.innerText = 'Copied!';
      setTimeout(function () {
        copyJoinLinkMsg.innerText = 'Copy Conference URL';
      }, 3000);
    };
  
    const handleControlBtnsOnJoinCall = () => {
      cameraIconContainer.style.opacity = 1.0;
      cameraIconContainer.style.pointerEvents = 'all';
      joinButton.style.display = 'none';
      leaveButton.style.display = 'block';
    };
  
    const handleControlBtnsOnLeaveCall = () => {
      joinButton.style.display = 'block';
      leaveButton.style.display = 'none';
      cameraIconContainer.style.opacity = 0.5;
      cameraIconContainer.style.pointerEvents = 'none';
      if (cameraPrompt.innerText === 'Camera On') {
        cameraPrompt.innerText = 'Camera Off';
      }
      if (startVideoBtn.style.display === 'block') {
        stopVideoBtn.style.display = 'block';
        startVideoBtn.style.display = 'none';
      }
    };
  
    const handleVideoBtnMouseEnter = () => {
      if (cameraPrompt.innerText === 'Camera On') {
        cameraPrompt.innerText = 'Turn Camera Off';
        stopVideoBtn.style.display = 'block';
        startVideoBtn.style.display = 'none';
      } else if (cameraPrompt.innerText === 'Camera Off') {
        cameraPrompt.innerText = 'Turn Camera On';
        stopVideoBtn.style.display = 'none';
        startVideoBtn.style.display = 'block';
      } else if (cameraPrompt.innerText == 'Turn Camera On') {
        cameraPrompt.innerText = 'Turn Camera Off';
        stopVideoBtn.style.display = 'block';
        startVideoBtn.style.display = 'none';
      }
    };
  
    const handleVideoBtnMouseLeave = () => {
      if (cameraPrompt.innerText === 'Camera On') {
        cameraPrompt.innerText = 'Camera On';
        stopVideoBtn.style.display = 'none';
        startVideoBtn.style.display = 'block';
      } else if (cameraPrompt.innerText === 'Camera Off') {
        cameraPrompt.innerText = 'Camera Off';
        stopVideoBtn.style.display = 'block';
        startVideoBtn.style.display = 'none';
      } else if (cameraPrompt.innerText === 'Turn Camera Off') {
        cameraPrompt.innerText = 'Camera On';
        stopVideoBtn.style.display = 'none';
        startVideoBtn.style.display = 'block';
      } else if (cameraPrompt.innerText === 'Turn Camera On') {
        cameraPrompt.innerText = 'Camera Off';
        stopVideoBtn.style.display = 'block';
        startVideoBtn.style.display = 'none';
      }
    };
  };