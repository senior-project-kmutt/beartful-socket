
import app from "./app";
import { config } from "./config/constant";
import mongoose, { ConnectOptions } from "mongoose";
import { Server } from 'socket.io';

export interface IChatMessages {
  chat_room_id: string;
  sender: string;
  message: string;
}


const startApp = async () => {
  try {
    const options: ConnectOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    };
    await mongoose.connect(config.mongodb.uri, options);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

const onlineUsers: Array<string> = new Array();
var alluser: Map<any, any> = new Map();
app.ready((err) => {
  if (err) throw err;
  app.io.of('/sockets/message').on("connection", (socket: any) => {
      onlineUsers.push(socket.id)
      console.info("Socket connected!", socket.id)

      socket.on("add-user", (userId: number) => {
          console.log(userId, "userId"); //ได้ userId มาไม่ตรงกับที่ส่งมาจาก front
          alluser.set(userId, socket.id)
          console.log(alluser);
      });

      socket.on("send-message", (message: IChatMessages, to: number)=>{
          const sentTo = alluser.get(to)
          // socket.to(sentTo).emit("recieved_message", message)

          //ถ้าส่งให้ client อื่นต้องระบุ socket id ไปด้วย
          onlineUsers.forEach((user) => {
              socket.to(user).emit("recieved_message", message)
          })

          //อันนี้ส่งกลับให้ตัวเอง
          socket.emit("recieved_message", message)
      });

      socket.on("send-test", (message: string, to: number)=>{
        const sentTo = alluser.get(to)
        // socket.to(sentTo).emit("recieved_message", message)

        //ถ้าส่งให้ client อื่นต้องระบุ socket id ไปด้วย
        onlineUsers.forEach((user) => {
            socket.to(user).emit("recieved_test", message)
        })

        //อันนี้ส่งกลับให้ตัวเอง
        socket.emit("recieved_test", message)
    });
  });
});

app.listen(config.port, "0.0.0.0");

startApp();


console.log(
  `🚀  Fastify server running on port ${config.hostname}:${config.port}`
);