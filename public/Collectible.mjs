class Collectible {
  constructor({x, y, value, id}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.width = 20; // example size
    this.height = 20;
  }
}

try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
