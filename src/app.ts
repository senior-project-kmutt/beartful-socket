import fastify from "fastify";
import fastifySocketIO from "./config/socket";
import { Server } from "socket.io";

declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}

const server = fastify({
  // Logger only for production
  logger: true,
});

server.register(fastifySocketIO, {
  path: '/ssi1-socket/',
  cors: {
    origin: '*',
  }
})


export default server;
