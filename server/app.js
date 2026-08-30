
import express from "express";
import connectDB from "./config/db.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import ticketRoutes from "./routes/TicketRoutes.js";
import agentRoutes  from "./routes/AgentRoutes.js"
import messageRoutes from "./routes/MessageRoutes.js";


import cors from 'cors'
import dns from "node:dns";
import { Server } from "socket.io";
import http from "http"


dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();




// HTTP Server
const server = http.createServer (app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];

// Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("joinTicket", (ticketId) => {
    socket.join(ticketId);
    console.log(`Socket ${socket.id} joined ticket room: ${ticketId}`);
  });

  socket.on("leaveTicket", (ticketId) => {
    socket.leave(ticketId);
    console.log(`Socket ${socket.id} left ticket room: ${ticketId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
connectDB();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// MiddleWare
app.use(express.json());

app.use((req,res,next)=>{
  console.log(req.url,req.method)
  next();
})

app.use('/api/auth',AuthRoutes)

app.use("/api/tickets", ticketRoutes);

app.use("/api/agents", agentRoutes);

app.use("/api/messages", messageRoutes);





server.listen(PORT, () => {
  console.log(`Server is listening at PORT ${PORT}`);
});
app.set("io", io)
