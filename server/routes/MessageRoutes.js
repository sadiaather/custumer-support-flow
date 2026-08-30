import express from "express";

import {
  sendMessage,
  getTicketMessages,
} from "../controller/MessageController.js";

import authMiddleware from "../middleware/AuthMiddleware.js";
import agentMiddleware from "../middleware/AgentMiddleware.js"

const router = express.Router();


// Customer send message
router.post(
  "/:ticketId",
  authMiddleware,
  sendMessage
);


// Agent send message
router.post(
  "/agent/:ticketId",
  agentMiddleware,
  sendMessage
);


// Customer get messages
router.get(
  "/:ticketId",
  authMiddleware,
  getTicketMessages
);


// Agent get messages
router.get(
  "/agent/:ticketId",
  agentMiddleware,
  getTicketMessages
);

export default router;
