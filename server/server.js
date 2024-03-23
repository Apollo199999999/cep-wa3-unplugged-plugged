import { Server } from "socket.io";

// create http server forwarding network traffic to socketio server
const io = new Server(8001, {
    cors: {
      origin: "*",
    },
});

console.log("Server running...")

io.on("connection", socket => {
    console.log("New connection!");
})