const { Server } = require("socket.io");
const http = require("http");
const app = require("express")();

const server = http.createServer(app);

const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

const players = {};
const signs = {
  x: false,
  o: false,
};
let currentPlayer = "x";
let board = ["", "", "", "", "", "", "", "", ""];

const winingPositions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(socketId) {
  winingPositions.forEach(([a, b, c]) => {
    if (board[a] == board[b] && board[b] == board[c] && board[c] == socketId) {
      return true;
    }
  });
  return false;
}

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
        } else if ("o") {
          signs["o"] = socket.id;
        } else {
          socket.emit("wrong-operator");
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
            `${[
              1, 2, 3, 4, 5, 6, 7, 8, 9,
            ]} choose any position which is a number`
          );
          console.log("game starts now");

          socket.on("position", (position) => {
            console.log("positions", position);
            position = parseInt(position);

            // check for correct user chance
            if (signs[currentPlayer] !== socket.id) {
              socket.emit(
                "wrong-player",
                "it's not your chance wait for yours"
              );
              return;
            }

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
            console.log(board[position], position, socket.id);
            board[position] = socket.id; // Use the player's id or sign (x/o)
            io.emit("board-update", board);

            // Additional game logic such as checking for a winner or switching turns

            if (checkWinner(socket.id)) {
              io.emit("winner", socket.id);
            } else if (
              signs[currentPlayer] == socket.id &&
              currentPlayer == "x"
            ) {
              currentPlayer = "o";
            } else {
              currentPlayer = "x";
            }

            console.log(board);
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

// const { Server } = require("socket.io");
// const http = require("http");
// const app = require("express")();

// const server = http.createServer(app);

// const io = new Server(server);

// const players = {};
// const signs = {
//   x: false,
//   o: false,
// };
// let currentPlayer = "x";
// let board = ["", "", "", "", "", "", "", "", ""];

// function checkWinner(socketId) {
//   let winnerCounter = 0;
//   let winnerSocketId = "";

//   for (let i = 0; i < 3; i++) {
//     if (((board[i] == board[i + 1]) == board[i + 2]) == socketId) {
//       winnerCounter++;
//     } else if (((board[i] == board[i + 3]) == board[i + 6]) == socketId) {
//       winnerCounter++;
//     } else if (((board[i] == board[i + 4]) == board[i + 8]) == socketId) {
//       winnerCounter++;
//     } else if (((board[i + 2] == board[i + 4]) == board[i + 6]) == socketId) {
//       winnerCounter++;
//     }

//     if (winnerCounter >= 1) {
//       winnerSocketId = socketId;
//     }
//   }

//   if (winnerSocketId.length) {
//     return true;
//   } else {
//     return false;
//   }
// }

// try {
//   io.on("connection", (socket) => {
//     io.emit("all", `${socket.id} connected`);

//     const id = socket.handshake.query.id;
//     players[id] = socket.id;

//     // player with operator assignment
//     if (Object.keys(players).length == 1) {
//       socket.on("sign", (sign) => {
//         if (sign == "x") {
//           signs["x"] = socket.id;
//         } else if ("o") {
//           signs["o"] = socket.id;
//         } else {
//           socket.emit("wrong-operator");
//         }

//         console.log(sign);
//         socket.emit("selections", signs);
//       });

//       socket.emit("selections", [players, signs]);
//     } else {
//       if (signs["x"] == false) {
//         signs["x"] = socket.id;
//       } else {
//         signs["o"] = socket.id;
//       }

//       socket.emit("selections", { ...players, ...signs });
//     }

//     //   start game

//     socket.on("start", (start) => {
//       if (start) {
//         if (
//           Object.keys(players).length == 2 &&
//           Object.keys(signs).length == 2 &&
//           signs.x &&
//           signs.o
//         ) {
//           io.emit(
//             "game starts now",
//             `${[
//               1, 2, 3, 4, 5, 6, 7, 8, 9,
//             ]} choose any position which is a number`
//           );
//           console.log("game starts now");

//           socket.on("position", (position) => {
//             console.log("positions", position);
//             position = parseInt(position);

//             // check for correct user chance
//             if (signs[currentPlayer] !== socket.id) {
//               socket.emit(
//                 "wrong-player",
//                 "it's not your chance wait for yours"
//               );
//               return;
//             }

//             // Check if x and y are within bounds of the board
//             if (position < 0 || position > 9) {
//               socket.emit("wrong-position", {
//                 message: "Position out of bounds",
//               });
//               return;
//             }

//             console.log(typeof board[position]);

//             if (typeof board[position] == "string" && board[position].length) {
//               socket.emit("invalid-position", board[position]);
//               return;
//             }

//             // Make the move if valid
//             console.log(board[position], position, socket.id);
//             board[position] = socket.id; // Use the player's id or sign (x/o)
//             io.emit("board-update", board);

//             // Additional game logic such as checking for a winner or switching turns

//             if (checkWinner(socket.id)) {
//               io.emit("winner", socket.id);
//             } else if (
//               signs[currentPlayer] == socket.id &&
//               currentPlayer == "x"
//             ) {
//               currentPlayer = "o";
//             } else {
//               currentPlayer = "x";
//             }

//             console.log(board);
//           });
//         }
//       }
//     });

//     socket.on("disconnect", () => {
//       io.emit("all", `${socket.id} disconnected`);

//       if (signs.x == players[id]) {
//         delete signs.x;
//       } else {
//         delete signs.o;
//       }
//       delete players[id];
//     });
//   });
// } catch (error) {
//   console.error(error?.message);
// }
// server.listen(5000, () => {
//   console.log("server running on port : 5000");
// });
