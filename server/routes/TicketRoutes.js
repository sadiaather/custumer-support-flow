import express from "express";

import {
  createTicket,
  getMyTickets,
  getSingleTicket,
  assignTicket,
  getAgentTickets,updateTicketStatus,
} from "../controller/TicketController.js";

import {
  getAllTickets
} from "../controller/TicketController.js";

import protect from "../middleware/AuthMiddleware.js";
import agentMiddleware from "../middleware/AgentMiddleware.js"

const router = express.Router();


router.get("/all", getAllTickets);

router.post(
  "/",
  protect,
  createTicket
);

router.get(
  "/my",
  protect,
  getMyTickets
);

router.get(
  "/agent/my",
  agentMiddleware,
  getAgentTickets
);

router.patch(
  "/:id/assign",
  agentMiddleware,
  assignTicket
);

router.get(
  "/:id",
  protect,
  getSingleTicket
);

router.patch(
  "/:id/status",
  agentMiddleware,
  updateTicketStatus
);




router.patch("/:ticketId/assign", assignTicket);


export default router;

