import Board from "./board";
import Piece from "./piece";

class Tetris {
  constructor(
    width,
    height,
    baseClock = 750,
    levelUpCap = 5,
    levelUpRate = 0.25,
  ) {
    this.baseClock = baseClock;
    this.levelUpCap = levelUpCap; // Level up every X points
    this.levelUpRate = levelUpRate; // Increase speed by YY%
    this.score = 0;
    this.width = width;
    this.height = height;
    this.board = this.newBoard();
    this.piece = null;
    this.gameOver = true;
  }

  reset() {
    this.board = this.newBoard();
    this.piece = this.newPiece();
    this.score = 0;
    this.gameOver = false;
  }

  level() {
    return Math.ceil(this.score/this.levelUpCap) || 1;
  }

  clock() {
    const increase = Math.pow(1+this.levelUpRate, this.level() - 1);

    return Math.ceil(this.baseClock/increase);
  }

  newPiece(x = 0, y = 0) {
    const piece = new Piece(x, y);
    piece.x = Math.floor(this.width/2 - piece.width()/2);
    return piece;
  }

  newBoard() {
    return new Board(this.width, this.height);
  }

  // Check if collision
  collision(piece) {
    let result = false;

    for (let dy = 0; dy < piece.shape.length; dy++) {
      if (result) break;

      for (let dx = 0; dx < piece.shape[dy].length; dx++) {
        if (piece.empty(dx, dy)) continue;

        const y = piece.y + dy;
        const x = piece.x + dx;
        if (!this.board.withinBounds(x, y)) {
          result = true;
          break;
        }

        if (!this.board.grid[y][x].empty()) {
          result = true;
          break;
        }
      }
    }

    return result;
  }

  next() {
    if (this.gameOver) return;

    const pieceDup = this.piece.dupe();
    pieceDup.move("down");

    if (this.collision(pieceDup)) {
      this.freeze(this.piece);
      this.piece = this.newPiece();
      if (this.collision(this.piece)) {
        this.gameOver = true;
      }
    } else {
      this.piece.move("down");
    }

    this.checkCompleteRows();
  }

  checkCompleteRows() {
    for (let y = 0; y < this.board.h; y++) {
      let complete = true;
      for (let x = 0; x < this.board.w; x++) {
        if (this.board.grid[y][x].empty()) {
          complete = false;
          break;
        }
      }
      if (complete) {
        this.score++;
        this.board.removeRow(y);
      }
    }
  }

  freeze(piece) {
    const shape = piece.shape;
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (!piece.empty(dx, dy)) {
          this.board.set(piece.x + dx, piece.y + dy, shape[dy][dx]);
        }
      }
    }
  }

  move(direction) {
    if (this.gameOver) return;

    const pieceDup = this.piece.dupe();
    pieceDup.move(direction);

    // If "the next move is a collision"
    if (this.collision(pieceDup)) return;

    this.piece.move(direction);
  }

  // Rotate until no collision
  rotate(direction) {
    for (let i = 0; i < 4; i++) {
      this.piece.rotate(direction);
      if(!this.collision(this.piece)) {
        break;
      }
    }
  }

  getFrame() {
    const board = new Board(...this.board.dupe());

    if (!this.piece) return board;

    const shape = this.piece.shape;

    if (!shape) return board;

    for(let dy = 0; dy < shape.length; dy++) {
      for(let dx = 0; dx < shape[dy].length; dx++) {
        if (!this.piece.empty(dx, dy)) {
          board.set(
            this.piece.x + dx,
            this.piece.y + dy,
            shape[dy][dx]
          );
        }
      }
    }

    return board;
  }

  printFrame() {
    const frame = this.getFrame();
    const grid = frame.grid;

    let print = "";
    for (let y = 0; y < frame.h; y++) {
      for (let x = 0; x < frame.w; x++) {
        print += ` ${frame.grid[y][x].value} `;
      }
      print +="\n";
    }

    return print;
  }

  withinBounds(piece) {
    let within = true;
    loop:
    for(let dy = 0; dy < piece.shape.length; dy++) {
      for(let dx = 0; dx < piece.shape[p_y].length; dx++) {
        const x = piece.x + dx;
        const y = piece.y + dy;

        if (!(piece.empty(dx, dy) && this.board.withinBounds(x,y))) {
          within = false;
          break loop;
        }
      }
    }
    return piece;
  }
}

export default Tetris;
