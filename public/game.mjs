import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let players = {};
let myId = null;
let collectible = null;

// Listen for game state from server
socket.on('players', (serverPlayers) => {
  players = serverPlayers;
  draw();
});

socket.on('collectible', (serverCollectible) => {
  collectible = serverCollectible;
  draw();
});

// Send join event
socket.emit('joinGame', {
  x: 100, y: 100, score: 0, id: socket.id, width: 30, height: 30
});

// Handle movement with keyboard
document.addEventListener('keydown', (e) => {
  let player = players[socket.id];
  if (!player) return;
  const speed = 10;
  if (e.key === 'ArrowUp') player.y -= speed;
  if (e.key === 'ArrowDown') player.y += speed;
  if (e.key === 'ArrowLeft') player.x -= speed;
  if (e.key === 'ArrowRight') player.x += speed;
  socket.emit('playerMove', player);

  // Check collision with collectible
  if (collectible && player.x < collectible.x + collectible.width &&
      player.x + player.width > collectible.x &&
      player.y < collectible.y + collectible.height &&
      player.y + player.height > collectible.y) {
    socket.emit('collect');
  }
});

// Draw function
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw collectible
  if (collectible) {
    context.fillStyle = 'red';
    context.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
  }

  // Draw players
  Object.values(players).forEach(player => {
    context.fillStyle = player.id === socket.id ? 'blue' : 'green';
    context.fillRect(player.x, player.y, player.width, player.height);
    context.fillStyle = 'black';
    context.fillText(`Score: ${player.score}`, player.x, player.y - 5);
  });
}
