const COLOURS = [
  '#CA281D', // Red
  '#F4AE01', // Yellow
  '#0071BB', // Blue
  '#11A159', // Green
  '#F56C46', // Orange
  '#008080', // Teal/Turq
  '#5BB5F2', // Light Blue
  '#7832B4', // Purple
];

const randomColour = () => {
  const index = math.floor(math.random() * COLOURS.length);
  return COLOURS[index];
};

const selectColour = (index) => {
  return COLOURS[index%(COLOURS.length)];
};

module.exports = {
  randomColour,
  selectColour,
};

