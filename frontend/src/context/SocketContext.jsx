import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [taskUpdateTick, setTaskUpdateTick] = useState(0);
  const [routineUpdateTick, setRoutineUpdateTick] = useState(0);

  useEffect(() => {
    if (!user?._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSocket(null);
      return;
    }

    const socketInstance = io(
      import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000",
      {
        withCredentials: true,
      }
    );

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      if (import.meta.env.DEV) {
        console.log("Connected to socket server");
      }
      socketInstance.emit("join-user-room", user._id);
    });

    socketInstance.on("connect_error", (err) => {
      if (import.meta.env.DEV) {
        console.error("Socket connection error:", err.message);
      }
    });

    socketInstance.on("task-update", () => {
      setTaskUpdateTick((prev) => prev + 1);
    });

    socketInstance.on("routine-update", () => {
      setRoutineUpdateTick((prev) => prev + 1);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, taskUpdateTick, routineUpdateTick }}>
      {children}
    </SocketContext.Provider>
  );
};
