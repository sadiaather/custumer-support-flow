import Ticket from "../model/TicketModel.js";
import Agent from "../model/AgentModel.js";
import User from "../model/UserModel.js";
import mongoose from "mongoose";

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("customer", "name email")
      .populate("agent", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Tickets fetched successfully",
      totalTickets: tickets.length,
      tickets,
    });

  } catch (error) {
    console.error("Get All Tickets Error:", error);

    return res.status(500).json({
      message: "Failed to get tickets",
      error: error.message,
    });
  }
};

export const createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      priority,
    } = req.body;

    // Validation
    if (!subject || !description) {
      return res.status(400).json({
        message: "Subject and description are required",
      });
    }

    // Unique ticket number
    const ticketNumber = `TKT-${Date.now()}`;

    const ticket = await Ticket.create({
      ticketNumber,
      customer: req.user.id,
      subject,
      description,
      category: category || "Other",
      priority: priority || "Medium",
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("customer", "name email")
      .populate("agent", "name email");

    const io = req.app.get("io");
    if (io) {
      io.emit("ticketCreated", populatedTicket);
    }

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);

    res.status(500).json({
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      customer: req.user.id,
    })
      .populate("customer", "name email")
      .populate("agent", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

export const getSingleTicket = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (req.user && req.user.role !== "agent") {
      query.customer = req.user.id;
    }

    const ticket = await Ticket.findOne(query)
      .populate("customer", "name email")
      .populate("agent", "name email");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      ticket,
    });
  } catch (error) {
    console.error("Get single ticket error:", error);

    res.status(500).json({
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};

// assign ticket
export const assignTicket = async (req, res) => {
  try {
    const identifier = req.params.ticketId || req.params.id;
    const agentId = req.body.agentId || (req.agent && req.agent.id);

    console.log("Ticket Identifier:", identifier);
    console.log("Agent ID:", agentId);

    if (!identifier) {
      return res.status(400).json({
        message: "Ticket identifier is required",
      });
    }

    if (!agentId) {
      return res.status(400).json({
        message: "Agent ID is required",
      });
    }

    // Find ticket by _id or ticketNumber
    let ticket = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      ticket = await Ticket.findById(identifier);
    }
    if (!ticket) {
      ticket = await Ticket.findOne({ ticketNumber: identifier });
    }

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // Find agent
    const agent = await Agent.findById(agentId);

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    if (!agent.isActive) {
      return res.status(400).json({
        message: "Agent is inactive",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).json({
        message: "Resolved ticket cannot be assigned",
      });
    }

    // Assign agent
    ticket.agent = agent._id;
    if (ticket.status === "New") {
      ticket.status = "Assigned";
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("customer", "name email")
      .populate("agent", "name email");

    const io = req.app.get("io");
    if (io) {
      io.to(ticket._id.toString()).emit("ticketUpdated", updatedTicket);
      io.emit("ticketUpdated", updatedTicket);
    }

    return res.status(200).json({
      message: "Ticket assigned successfully",
      ticket: updatedTicket,
    });

  } catch (error) {
    console.error("Assign ticket error:", error);

    return res.status(500).json({
      message: "Failed to assign ticket",
      error: error.message,
    });
  }
};

// get agent ticket
export const getAgentTickets = async (req, res) => {
  try {
    const agentId = req.agent.id;

    const tickets = await Ticket.find({
      agent: agentId,
    })
      .populate("customer", "name email")
      .populate("agent", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      tickets,
    });
  } catch (error) {
    console.error("Get agent tickets error:", error);

    res.status(500).json({
      message: "Failed to fetch agent tickets",
      error: error.message,
    });
  }
};

// update ticket status
export const updateTicketStatus = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;
    const { id } = req.params;

    const allowedStatuses = [
      "New",
      "Assigned",
      "In Progress",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // Agent can update only assigned ticket
    if (
      !ticket.agent ||
      ticket.agent.toString() !== req.agent.id
    ) {
      return res.status(403).json({
        message: "This ticket is not assigned to you",
      });
    }

    // Resolved ticket cannot be changed
    if (ticket.status === "Resolved") {
      return res.status(400).json({
        message: "Resolved ticket cannot be changed",
      });
    }

    // Resolution note required
    if (
      status === "Resolved" &&
      (!resolutionNote || !resolutionNote.trim())
    ) {
      return res.status(400).json({
        message: "Resolution note is required",
      });
    }

    ticket.status = status;

    if (status === "Resolved") {
      ticket.resolutionNote = resolutionNote.trim();
    }

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("customer", "name email")
      .populate("agent", "name email");

    const io = req.app.get("io");
    if (io) {
      io.to(ticket._id.toString()).emit("ticketUpdated", populatedTicket);
      io.emit("ticketUpdated", populatedTicket);
    }

    res.status(200).json({
      message: "Ticket status updated successfully",
      ticket: populatedTicket,
    });

  } catch (error) {
    console.error("Update ticket status error:", error);

    res.status(500).json({
      message: "Failed to update ticket status",
      error: error.message,
    });
  }
};

