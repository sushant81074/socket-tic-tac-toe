# socket-tic-tac-toe

Certainly! Below is a sample `README.md` file for your Tic-Tac-Toe server application:

---

# Tic-Tac-Toe Server

This is a simple real-time multiplayer Tic-Tac-Toe game server implemented using Node.js with Socket.IO. It allows two players to connect and play Tic-Tac-Toe through a web-based client.

## Features

- **Real-time Multiplayer:** Players can connect and play in real-time.
- **Player Sign Assignment:** Players are assigned "X" or "O" as their sign.
- **Game Start:** Players can start the game once both players are connected and assigned their signs.
- **Move Validation:** Players can make moves by selecting positions on the board.
- **Win Detection:** The server checks for a winning condition after every move.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/sushant81074/tic-tac-toe-server.git
   cd tic-tac-toe-server
   ```

2. **Install Dependencies:**

   Ensure you have Node.js installed. Then, install the required packages:

   ```bash
   npm install
   ```

## Usage

1. **Start the Server:**

   Run the following command to start the server:

   ```bash
   node server.js
   ```

   The server will start on port `5000` by default. You can access it via `http://localhost:5000`.

2. **Connecting Clients:**

   Connect clients to the server using Socket.IO. Clients need to emit events such as `"sign"`, `"start"`, and `"position"` to interact with the server.

## API

- **`connection`**: Event emitted when a client connects.
- **`sign`**: Event for players to choose their sign (`"x"` or `"o"`).
- **`start`**: Event to start the game once both players are ready.
- **`position`**: Event for players to make a move by specifying a board position (0-8).
- **`disconnect`**: Event emitted when a player disconnects from the server.

## Game Logic

- **`checkWinner(socketId)`**: Function to check if the player with the given `socketId` has won the game.
- **`board`**: Array representing the Tic-Tac-Toe board (9 positions).
- **`currentPlayer`**: Keeps track of whose turn it is.

## Error Handling

- **`wrong-operator`**: Emitted when an invalid sign is chosen.
- **`wrong-player`**: Emitted when a player tries to make a move out of turn.
- **`wrong-position`**: Emitted when a position is out of bounds.
- **`invalid-position`**: Emitted when a position is already taken.

## Contributing

Feel free to submit issues or pull requests. Contributions are welcome!

## License

NONE

## Contact

For any questions or feedback, please contact me at [sushant94601@gmail.com].

---

Feel free to adjust any sections or details according to your project's specifics or preferences!
