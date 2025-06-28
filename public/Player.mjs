class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score || 0;  // Initialize score
    this.id = id;
    this.width = 20;  // Add width property
    this.height = 20; // Add height property
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
    }
  }

  collision(item) {
    return (
      this.x < item.x + item.width &&
      this.x + this.width > item.x &&
      this.y < item.y + item.height &&
      this.y + this.height > item.y
    );
  }

  calculateRank(playersArr) {
    // Sort descending by score
    const sorted = [...playersArr].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex(p => p.id === this.id) + 1;
    return `Rank: ${rank}/${playersArr.length}`;
  }
}

export default Player;
