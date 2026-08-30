import express from "express";

import {
  loginAgent,registerAgent,
  getAgentDashboard,
} from "../controller/AgentController.js";

import agentMiddleware from "../middleware/AgentMiddleware.js";

const router = express.Router();

router.post("/login", loginAgent);

router.post("/register",registerAgent)

router.get(
  "/dashboard",
  agentMiddleware,
  getAgentDashboard
);

export default router;

