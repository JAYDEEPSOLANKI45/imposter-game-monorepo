import express, { type Express } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

import {
  joinRoom,
  createPlayer,
  disconnectUser,
  startFirstRoundGame,
  players,
  rooms,
  promptSend,
  voteSend,
  leaveRoom,
} from "./utils/utils.ts";

const app: Express = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket: Socket) => {
  socket.on("join-room", ({ roomId }: { roomId: string }) => {
    console.log(socket.id + " Joined " + roomId);
    joinRoom(socket, roomId);
  });

  socket.on("leave-room", ({ roomId }: { roomId: string }) => {
    console.log(socket.id + " leaving room: ", roomId);
    leaveRoom(socket, roomId);
  });

  socket.on(
    "create-player",
    ({ name, socketId }: { name: string; socketId: string }) => {
      createPlayer(socket, name, socketId);
    }
  );

  socket.on("start-game", (roomId) => {
    try {
      startFirstRoundGame(socket, roomId);
    } catch (e) {
      socket.emit("error-occur", { message: `Room id:${roomId} not found` });
    }
  });

  socket.on("disconnect", () => {
    try {
      disconnectUser(socket);
    } catch (e) {
      socket.emit("error-occur", {
        message: "Error deleting the user from data",
        status: 500,
      });
    }
  });

  //for admin
  socket.on("admin-request", () => {
    socket.emit("admin-data", {
      players: Object.fromEntries(players),
      rooms: Object.fromEntries(rooms),
    });
  });

  socket.on("prompt-send", ({ prompt }: { prompt: string }) => {
    promptSend({ socket, prompt });
  });

  socket.on("vote-send", ({ vote }: { vote: string }) => {
    voteSend({ socket, vote });
  });
});

server.listen(8080, () => {
  console.log("Listening on 8080");
});

export default io;
