class Point {
  constructor(value = 0, color = '#1D1D1D') {
    this.value = value;
    this.color = color;
  }

  empty() {
    return this.value == null || this.value == 0;
  }
}

export default Point;
