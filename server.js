const http = require('http');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const socketio = require('socket.io');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Helmet and security middleware
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PHP 7.4.3');
  next();
});
app.use(cors({origin: '*'}));

// Static files
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/').get((req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

// --- YOUR GAME LOGIC HERE ---
// Example: Keep track of players and collectibles
const players = {};
let collectible = { x: 300, y: 200, value: 1, id: 'c1', width: 20, height: 20 };

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send current game state to the new player
  socket.emit('collectible', collectible);
  socket.emit('players', players);

  // Handle player joining
  socket.on('joinGame', (playerData) => {
    players[socket.id] = playerData;
    io.emit('players', players); // sync all clients
  });

  // Handle player movement
  socket.on('playerMove', (playerData) => {
    players[socket.id] = playerData;
    io.emit('players', players);
  });

  // Handle collectible collection
  socket.on('collect', () => {
    // Move collectible to a new random position
    collectible = {
      x: Math.floor(Math.random() * 600),
      y: Math.floor(Math.random() * 440),
      value: 1,
      id: Math.random().toString(36).substr(2, 9),
      width: 20,
      height: 20
    };
    io.emit('collectible', collectible);
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('players', players);
  });
});

// Start the server
const portNum = process.env.PORT || 3000;
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    setTimeout(() => {
      try {
        runner.run();
      } catch (error) {
        console.error(error);
      }
    }, 1500);
  }
});
