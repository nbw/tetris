// Handles Rendering of the board onto a canvas

const render = (canvasCtx, tetris, pixelSize = 10) => {
  const frame = tetris.getFrame();
  for (let y = 0; y < frame.h; y++) {
    for (let x = 0; x < frame.w; x++) {
      canvasCtx.fillStyle = frame.grid[y][x].color;
      canvasCtx.fillRect(
        x*pixelSize,
        y*pixelSize,
        pixelSize,
        pixelSize
      );
    }
  }
}

const update = (id, value) => {
  document.getElementById(id).innerHTML = value;
}

const toggle = (element, klass) => {
  if (element.classList.contains(klass)) {
    element.classList.remove(klass);
  } else {
    element.classList.add(klass);
  }
}

const showGameButtons = () => {
  document.getElementById("game-buttons").classList.add("active");
}
const hideGameButtons = () => {
  document.getElementById("game-buttons").classList.remove("active");
}

module.exports = {
  render,
  update,
  toggle,
  showGameButtons,
  hideGameButtons,
};
