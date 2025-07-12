const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = 3000;

const io = new Server(server);

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', (socket) => {
   
    console.log('User connected:', socket.id);
  
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});