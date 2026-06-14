import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';

const parseCookies = (cookieString) => {
  const list = {};
  if (!cookieString) return list;
  cookieString.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
};

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

  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = parseCookies(cookieHeader);
      let token = cookies.token;

      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }
      if (!token && socket.handshake.headers.authorization?.startsWith("Bearer ")) {
        token = socket.handshake.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return next(new Error("Authentication error: Token not found"));
      }

      if (!process.env.JWT_SECRET) {
        return next(new Error("Authentication error: JWT secret not set"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: [JWT_ALGORITHM],
      });

      socket.userId = decoded.id || decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    if (process.env.NODE_ENV === "development") {
      console.log("A user connected:", socket.id);
    }

    socket.on("join-user-room", (userId) => {
      if (userId && userId.toString() === socket.userId?.toString()) {
        socket.join(socket.userId);
        if (process.env.NODE_ENV === "development") {
          console.log(`User ${socket.userId} joined their room.`);
        }
      } else {
        console.warn(`User ${socket.userId} tried to join unauthorized room: ${userId}`);
      }
    });

    socket.on("disconnect", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("A user disconnected:", socket.id);
      }
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

export const emitToUserRoom = (userId, event, data) => {
  try {
    if (io && userId) {
      io.to(userId.toString()).emit(event, data);
    }
  } catch (err) {
    console.error("Failed to emit socket event:", err);
  }
};
