import { Server } from "socket.io";
import GameService from "./service/GameService.js";
import QuestionService from "./service/QuestionService.js";
import RoomService from "./service/RoomService.js";
import e from "express";

let io;
const gameService = new GameService();
const questionService = new QuestionService();
const roomService = new RoomService();
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    let GlobalRoom;
    socket.on("join", async (playerName) => {
      const player = {
        playerId: socket.id,
        playerName: playerName,
      };
      const createdRoom = await gameService.joinGame(player);
      socket.join(createdRoom.roomId);
      GlobalRoom = createdRoom.roomId;
      const room = {
        roomId: createdRoom.roomId,
        players: createdRoom.players,
        stats: createdRoom.stats,
      };
      socket.emit("joined", room);
      if (createdRoom.players.length === 2) {
        console.error("Here Room", room);
        io.to(room.roomId).emit("startGame", room);
      }
    });
    socket.on("joinPrivate", async (playerName) => {
      const player = {
        playerId: socket.id,
        playerName: playerName,
      };
      const createdRoom = await gameService.joinPrivateGame(player);
      socket.join(createdRoom.roomId);
      GlobalRoom = createdRoom.roomId;
      const room = {
        roomId: createdRoom.roomId,
        players: createdRoom.players,
        stats: createdRoom.stats,
      };
      socket.emit("joined", room);
    });
    socket.on("joinByRoom", async (roomId, playerName) => {
      console.error("Join By Room => ", roomId);
      console.error("Join By Room => ", playerName);
      const player = {
        playerId: socket.id,
        playerName: playerName,
      };
      const room = await gameService.joinGameByPrivateId(roomId, player);
      if (room) {
        socket.join(room.roomId);
        GlobalRoom = room.roomId;
        const roomData = {
          roomId: room.roomId,
          players: room.players,
          stats: room.stats,
        };
        socket.emit("joined", roomData);
        if (room.players.length === 2) {
          io.to(room.roomId).broadcast("startGame", roomData);
        }
      } else {
        socket.emit("error", "Room not found");
      } // Add closing parenthesis and semicolon here
    });
    socket.on("ready", async (userRoom) => {
      let room;
      if (await roomService.exists(userRoom.roomId)) {
        room = await roomService.getRoomById(userRoom.roomId);
        GlobalRoom = userRoom.roomId;
      }
      const questions = room.questions;
      for (let question of questions) {
        const newQuestion = {
          questionId: question._id,
          question: question.question,
          options: question.options,
        };
        await new Promise((resolve) => setTimeout(resolve, 10000));
        io.to(room.roomId).emit("question", newQuestion);
      }
      await new Promise((resolve) => setTimeout(resolve, 10000));
      io.to(room.roomId).emit("gameOver");
    });
    socket.on("gameOver", async (answerMap) => {
      console.error(answerMap);
      const room = await roomService.getRoomById(answerMap.roomId);
      GlobalRoom = answerMap.roomId;
      console.error("Check User => ", answerMap.user.toString());
      let cnt = 0;
      console.error(answerMap.questions);
      console.error(typeof answerMap.questions);
      for (const [key, value] of Object.entries(answerMap.questions)) {
        console.error(key + " => " + value);
        const question = await questionService.getQuestionById(key);
        if (question.answer === value) {
          cnt++;
        }
      }

      if (room.players[0].playerName === answerMap.user) {
        room.players[0].score = cnt;
        room.players[0].verified = true;
      } else if (room.players[1].playerName === answerMap.user) {
        room.players[1].score = cnt;
        room.players[1].verified = true;
      } else {
        console.error("User not found in room");
      }
      if (room.players[0].score > room.players[1].score) {
        room.stats.winner = room.players[0].playerName;
        room.stats.looser = room.players[1].playerName;
      } else if (room.players[0].score < room.players[1].score) {
        room.stats.winner = room.players[1].playerName;
        room.stats.looser = room.players[0].playerName;
      } else {
        room.stats.draw = true;
      }
      console.error("Before Save: ", room);
      room.save();
      if (room.players[0].verified && room.players[1].verified) {
        io.to(room.roomId).emit("endGame", room);
        console.error("Game Over!!!!!!!!!!!!!");
      }
    });
    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
      io.to(GlobalRoom).emit("leftRoom", "Opponent Has Disconnected!");
      roomService.deleteRoomBySocketId(socket.id);
      socket.leave(socket.id);
    });
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
