const bradyNames = [
  'Mike Brady',
  'Carol Brady',
  'Marcia Brady',
  'Jan Brady',
  'Cindy Brady',
  'Greg Brady',
  'Bobby Brady',
];

let randomName = bradyNames[Math.floor(Math.random() * bradyNames.length)];

// streamAdded event is emitted to other participants when a participant joins
VoxeetSDK.conference.on('streamAdded', (participant, stream) => {
  assignSpatialPos(participant);
  if (stream.getVideoTracks().length) {
    // Only add the video node if there is a video track
    addVideoNode(participant, stream);
  }
});

VoxeetSDK.conference.on('streamUpdated', (participant, stream) => {
  if (stream.getVideoTracks().length) {
    // Only add the video node if there is a video track
    addVideoNode(participant, stream);
  }
});

VoxeetSDK.conference.on('streamRemoved', (participant, stream) => {
  removeVideoNode(participant);
});

const main = async () => {
  VoxeetSDK.initialize('IoIcJ1w_bdSfHywYZk2_6w==', 'C2DmyJL38jG8pMMKM7Uqp6y6aL-9vUBES_BIHIiUDkw=');
  try {
    await VoxeetSDK.session.open({ name: randomName });
    initUI();
  } catch (e) {
    alert('Something went wrong : ' + e);
  }
};

main();