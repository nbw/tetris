import Point from "./point";

class Board {
  constructor(w, h, grid = null) {
    this.w = w;
    this.h = h;
    this.grid = grid || this.blankGrid();
  }

  blankGrid() {
    const grid = [];
    for (let y = 0; y < this.h; y++) {
      grid.push(this.newRow());
    }
    return grid;
  }

  newRow() {
    return new Array(this.w).fill(new Point(0));
  }

  removeRow(y) {
    this.grid.splice(y,1);
    this.grid.unshift(this.newRow());
  }

  // Sets value, but ignores if out of bounds
  set(x,y, value) {
    if (this.withinBounds(x, y)) {
      this.grid[y][x] = value;
    }
  }

  dupe() {
    const grid = [];
    for (let y = 0; y < this.h; y++) {
      const row = [];
      for (let x = 0; x < this.w; x++) {
        row.push(this.grid[y][x]);
      }
      grid.push(row)
    }
    return [this.w, this.h, grid];
  }

  withinBounds(x,y) {
    return (x >= 0) && (x < this.w) && (y >= 0) && (y < this.h);
  }
}

export default Board;
