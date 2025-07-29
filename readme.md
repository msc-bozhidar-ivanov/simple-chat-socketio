# Simple Chat App with Socket.IO

A real-time chat application built with **Node.js**, **Express**, **Socket.IO**, and **MongoDB**. It supports global chat, custom rooms, message history, typing indicators, and online user tracking.

---

## Features

- Real-time messaging using Socket.IO
- Global chat and custom chat rooms
- User presence and typing indicators
- Chat history stored in MongoDB
- Join/leave and delete rooms
- Responsive frontend with basic UI
- Room and user state cached in memory for performance

---

## Technologies Used

- Node.js
- Express
- Socket.IO
- MongoDB with Mongoose
- JavaScript (ES Modules)
- HTML/CSS (Bootstrap)

---

## Installation

1. **Clone or unzip the project**

```bash
cd simple-chat-socketio
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory (already included):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/simple-chat
```

4. **Start MongoDB** (make sure MongoDB is installed and running on your system):

```bash
mongod
```

5. **Start the server**

```bash
npm start
```

6. **Open the app**

Go to `http://localhost:3000` in your browser.

---

## Project Structure

```
simple-chat-socketio/
├── .env                      # Environment variables
├── config/                  # Configuration logic
│   └── config.js            # Loads .env and exports config
├── db/                      # Database logic
│   ├── db.js                # MongoDB connection
│   └── models/              # Mongoose schemas
├── public/                  # Frontend files
│   ├── index.html
│   └── js/
│       ├── events.js
│       ├── main.js
│       ├── socket.js
│       └── ui.js
├── server/                  # Backend logic
│   ├── server.js            # Express and Socket.IO setup
│   ├── socketHandler.js     # Main socket handling
│   ├── userManager.js       # User cache and DB logic
│   ├── roomManager.js       # Room cache and DB logic
│   └── messageUtils.js      # Helper for timestamps
├── package.json             # Node.js dependencies and scripts
```

---

## Scripts

```bash
npm start       # Start server
npm run dev     # Start with nodemon (if configured)
```

---

## Environment Configuration

Configuration is managed using a `.env` file and imported via `config/config.js`. This allows flexible settings for:

- Server port
- MongoDB URI

---

## Notes

- Typing indicators use Socket.IO emitters scoped to rooms.
- All chat messages are stored in MongoDB and retrieved when joining rooms.
- Basic in-memory caching improves user/room performance.
- Custom room deletion and user reassignment to Global Chat are supported.

---

## License

MIT

