import Agent from "../model/AgentModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Ticket from "../model/TicketModel.js";

 const secret = process.env.secret

// / ==================== AGENT REGISTER ====================

export const registerAgent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingAgent = await Agent.findOne({
      email: email.toLowerCase(),
    });

    if (existingAgent) {
      return res.status(400).json({
        message: "Agent already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = await Agent.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "agent",
      isActive: true,
    });

    res.status(201).json({
      message: "Agent registered successfully",
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
      },
    });

  } catch (error) {
    console.error("Agent Register Error:", error);

    res.status(500).json({
      message: "Agent registration failed",
      error: error.message,
    });
  }
};

export const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const agent = await Agent.findOne({ email });

    if (!agent) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!agent.isActive) {
      return res.status(403).json({
        message: "Agent account is inactive",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      agent.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: agent._id.toString(),
        role: "agent",
      },
      secret,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Agent login successful",
      token,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
      },
    });
  } catch (error) {
    console.error("Agent login error:", error);

    res.status(500).json({
      message: "Agent login failed",
      error: error.message,
    });
  }
};

// agent dashboard

export const getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.agent.id;

    console.log("Agent ID:", agentId);

    const tickets = await Ticket.find({
      agent: agentId,
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Agent dashboard loaded successfully",
      totalTickets: tickets.length,
      tickets,
    });

  } catch (error) {
    console.error("Agent dashboard error:", error);

    res.status(500).json({
      message: "Failed to load agent dashboard",
      error: error.message,
    });
  }
};
