import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { jwtSecretKey } from '../controller/auth.js';

class Socket {
  constructor(server) {
    //소켓을 만들고
    this.io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    //socket에서의 Auth를 체크하기위한 로직이다
    this.io.use((socket, next) => {
      //client와의 handshake

      const token = socket.handshake.auth.token;
      console.log(token, 'token');
      if (!token) {
        return next(new Error('Authentication error'));
      }

      jwt.verify(token, jwtSecretKey, (error, decoded) => {
        if (error) {
          return next(new Error('Authentication error'));
        }
        next();
      });
    });

    this.io.on('connection', socket => {
      console.log('Socket client connected');
    });
  }
}

let socket;
export function initSocket(server) {
  if (!socket) {
    socket = new Socket(server);
  }
}

export function getSocketIO() {
  if (!socket) {
    throw new Error('Please call init first');
  }
  return socket.io;
}
