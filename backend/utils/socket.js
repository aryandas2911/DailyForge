import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://dailyforge-frontend-lhjq.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        process.env.CLIENT_ORIGIN,
      ].filter(Boolean),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-user-room", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room.`);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
