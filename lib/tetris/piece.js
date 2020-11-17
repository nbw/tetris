import {selectColour} from './colour';
import Point from './point';

const SHAPES = [
  [
    [1,0,0],
    [1,1,1],
    [0,0,0]
  ],
  [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0],
  ],
  [
    [1,1],
    [1,1],
  ],
  [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ],
];

class Piece {
  constructor(x,y, shape = null) {
    this.x = x;
    this.y = y;
    this.shape = shape || this.initShape();
  }

  initShape() {
    const [shape, index] = this.randomShape();
    const grid = [];
    for (let i = 0; i < shape.length; i++) {
      const row = [];
      for (let j = 0; j < shape[i].length; j++) {
        const colour = shape[i][j] && selectColour(index) || "white"
        row.push(new Point(shape[i][j], colour));
      }
      grid.push(row);
    }
    return grid;
  }

  dupe() {
    return new Piece(this.x, this.y, this.shape);
  }

  move(direction) {
    switch(direction) {
      case "down":
        this.y++;
        break;
      case "left":
        this.x--;
        break;
      case "right":
        this.x++;
        break;
    }
  }

  rotate(direction = "cw") {
    if (direction != "cw" && direction != "ccw") {
      return this;
    }

    for (let i = 0; i < this.shape.length; i++) {
      for (let j = 0; j < i; j++) {
        [
          this.shape[i][j],
          this.shape[j][i]
        ] = [
          this.shape[j][i],
          this.shape[i][j]
        ];
      }
    }

    switch(direction) {
      case "ccw":
        this.shape.map(row => row.reverse());
        break;
      case "cw":
        this.shape.reverse();
        break;
    }

    return this;
  }

  empty(x,y) {
    return this.shape[y][x].empty();
  }

  width() {
    if (this.shape.length == 0) return 0;

    return this.shape[0].length;
  }

  randomShape() {
    const index = Math.floor(Math.random() * SHAPES.length);
    return [SHAPES[index], index];
  }
}

export default Piece;
