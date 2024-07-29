const { Server } = require("socket.io");
const http = require("http");
const app = require("express")();

const server = http.createServer(app);

const io = new Server(server);

const players = {};
const signs = {
  x: false,
  o: false,
};
const currentPlayer = "x";
let board = ["", "", "", "", "", "", "", "", ""];

try {
  io.on("connection", (socket) => {
    io.emit("all", `${socket.id} connected`);

    const id = socket.handshake.query.id;
    players[id] = socket.id;

    // player with operator assignment
    if (Object.keys(players).length == 1) {
      socket.on("sign", (sign) => {
        if (sign == "x") {
          signs["x"] = socket.id;
        } else {
          signs["o"] = socket.id;
        }

        console.log(sign);
        socket.emit("selections", signs);
      });

      socket.emit("selections", [players, signs]);
    } else {
      if (signs["x"] == false) {
        signs["x"] = socket.id;
      } else {
        signs["o"] = socket.id;
      }

      socket.emit("selections", { ...players, ...signs });
    }

    //   start game

    socket.on("start", (start) => {
      if (start) {
        if (
          Object.keys(players).length == 2 &&
          Object.keys(signs).length == 2 &&
          signs.x &&
          signs.o
        ) {
          io.emit(
            "game starts now",
            `${board} choose any position which is a number`
          );
          console.log("game starts now");

          socket.on("position", (position) => {
            console.log("positions", position);
            position = parseInt(position);

            // Check if x and y are within bounds of the board
            if (position < 0 || position > 9) {
              socket.emit("wrong-position", {
                message: "Position out of bounds",
              });
              return;
            }

            console.log(typeof board[position]);

            if (typeof board[position] == "string" && board[position].length) {
              socket.emit("invalid-position", board[position]);
              return;
            }

            // Make the move if valid
            board[position] = socket.id; // Use the player's id or sign (x/o)
            io.emit("boardUpdate", board);

            console.log(socket.id, board);

            // Additional game logic such as checking for a winner or switching turns
          });
        }
      }
    });

    socket.on("disconnect", () => {
      io.emit("all", `${socket.id} disconnected`);

      if (signs.x == players[id]) {
        delete signs.x;
      } else {
        delete signs.o;
      }
      delete players[id];
    });
  });
} catch (error) {
  console.error(error?.message);
}
server.listen(5000, () => {
  console.log("server running on port : 5000");
});

// // choose op
// // init board
// // start game
// // take turns

// // const onlineUserSockets = { id : socket.id }
// // const assignedOperators = {operator : socket.id}
// // const board = [[],[],[]]

// const http = require("http");
// const { Server } = require("socket.io");
// const app = require("express")();

// const server = http.createServer(app);
// const io = new Server(server);

// const players = {};
// const signs = { x: null, o: null };
// let currentPlayer = "x";
// const board = Array(9).fill(null);

// io.on("connection", (socket) => {
//   const id = socket.handshake.query.id;
//   players[id] = socket.id;

//   // Player sign assignment
//   if (Object.keys(players).length == 1) {
//     socket.emit("chooseSign", { message: "Choose your sign (x or o)" });

//     socket.on("sign", (sign) => {
//       if (sign === "x" && !signs.x) {
//         signs.x = socket.id;
//         socket.emit("signAssigned", { sign: "x" });
//       } else if (sign === "o" && !signs.o) {
//         signs.o = socket.id;
//         socket.emit("signAssigned", { sign: "o" });
//       } else {
//         socket.emit("signError", { message: "Sign already taken or invalid" });
//       }
//     });
//   } else {
//     if (!signs.x) {
//       signs.x = socket.id;
//       socket.emit("signAssigned", { sign: "x" });
//     } else if (!signs.o) {
//       signs.o = socket.id;
//       socket.emit("signAssigned", { sign: "o" });
//     } else {
//       socket.emit("signError", { message: "Game is full" });
//     }
//   }

//   // Start game check
//   socket.on("start", () => {
//     if (signs.x && signs.o) {
//       io.emit("gameStart", { message: "Game starts now", board });
//     }
//   });

//   // Handle move
//   socket.on("move", (position) => {
//     if (socket.id !== signs[currentPlayer]) {
//       socket.emit("turnError", { message: "It's not your turn" });
//       return;
//     }

//     if (position < 0 || position > 8 || board[position] !== null) {
//       socket.emit("moveError", { message: "Invalid move" });
//       return;
//     }

//     board[position] = currentPlayer;
//     io.emit("boardUpdate", { board });

//     if (checkWinner(currentPlayer)) {
//       io.emit("gameEnd", { message: `${currentPlayer.toUpperCase()} wins!` });
//       resetGame();
//     } else if (board.every((cell) => cell !== null)) {
//       io.emit("gameEnd", { message: "It's a draw!" });
//       resetGame();
//     } else {
//       currentPlayer = currentPlayer === "x" ? "o" : "x";
//       io.emit("turnUpdate", { currentPlayer });
//     }
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     io.emit("playerDisconnect", `${socket.id} disconnected`);
//     if (signs.x === socket.id) signs.x = null;
//     if (signs.o === socket.id) signs.o = null;
//     delete players[id];
//     resetGame();
//   });
// });

// function checkWinner(player) {
//   const winningCombinations = [
//     [0, 1, 2],
//     [3, 4, 5],
//     [6, 7, 8],
//     [0, 3, 6],
//     [1, 4, 7],
//     [2, 5, 8],
//     [0, 4, 8],
//     [2, 4, 6],
//   ];

//   return winningCombinations.some((combination) => {
//     return combination.every((index) => board[index] === player);
//   });
// }

// function resetGame() {
//   board.fill(null);
//   currentPlayer = "x";
//   io.emit("boardUpdate", { board });
//   io.emit("turnUpdate", { currentPlayer });
// }

// server.listen(5000, () => {
//   console.log("Server running on port 5000");
// });
