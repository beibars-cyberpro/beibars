import { io } from 'socket.io-client';
import { SERVER_URL } from './config';

export const socket = io(SERVER_URL, {
  autoConnect: false,
  // Allow the default polling-then-upgrade negotiation instead of forcing
  // websocket-only, since some routers/networks block a direct ws upgrade.
  transports: ['polling', 'websocket'],
});
