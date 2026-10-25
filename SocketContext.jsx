import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to backend Socket.io server
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinShowRoom = (showId) => {
    if (socket && showId) {
      socket.emit('join_show_room', { showId, userId: user?._id });
    }
  };

  const lockSeat = (showId, seatNumber) => {
    if (socket && showId && seatNumber) {
      socket.emit('lock_seat', { showId, seatNumber, userId: user?._id });
    }
  };

  const unlockSeat = (showId, seatNumber) => {
    if (socket && showId && seatNumber) {
      socket.emit('unlock_seat', { showId, seatNumber, userId: user?._id });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinShowRoom, lockSeat, unlockSeat }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
