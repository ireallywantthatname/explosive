const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Game state storage
const gameSessions = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Create Socket.IO server
  const io = new Server(server);

  // Socket.IO logic
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a game session
    socket.on("joinGame", ({ gameId, playerName }) => {
      console.log(`Player ${playerName} is joining game ${gameId}`);

      let gameState = gameSessions.get(gameId);

      // If game doesn't exist, create a new one
      if (!gameState) {
        gameState = {
          redPosition: 1,
          bluePosition: 1,
          currentPlayer: "player1",
          diceValue: null,
          gameMessage: `Game started! ${playerName} joined as Player 1`,
          player1Name: playerName,
          player2Name: "",
          gameId,
        };
        gameSessions.set(gameId, gameState);
        socket.join(gameId);
        socket.emit("gameState", gameState);
        socket.emit("playerRole", "player1");
        console.log(`Created new game ${gameId} with player ${playerName}`);
      }
      // If game exists but needs a second player
      else if (!gameState.player2Name) {
        gameState.player2Name = playerName;
        gameState.gameMessage = `${playerName} joined as Player 2. Game is ready!`;
        gameSessions.set(gameId, gameState);
        socket.join(gameId);
        socket.emit("playerRole", "player2");
        // Notify all clients in the room about the updated state
        io.to(gameId).emit("gameState", gameState);
        console.log(
          `Player ${playerName} joined existing game ${gameId} as Player 2`
        );
      }
      // Game is already full
      else {
        socket.emit("error", { message: "Game already has two players" });
        console.log(
          `Failed join attempt: Game ${gameId} already has two players`
        );
        return;
      }

      // Listen for game updates from this client
      socket.on("gameAction", (action) => {
        console.log(`Game action in ${gameId}:`, action);
        const gameState = gameSessions.get(gameId);
        if (!gameState) return;

        // Update game state based on action
        const updatedState = {
          ...gameState,
          ...action,
        };

        gameSessions.set(gameId, updatedState);

        // Broadcast updated state to all clients in the room
        io.to(gameId).emit("gameState", updatedState);
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // We could handle cleanup here, but for now we'll keep game sessions alive
      // so players can reconnect
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
