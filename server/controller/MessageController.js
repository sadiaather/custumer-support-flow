import Message from "../model/MessageModel.js";
import Ticket from "../model/TicketModel.js";


// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { ticketId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    let senderId;
    let senderRole;

    // Agent
    if (req.agent) {
      senderId = req.agent.id;
      senderRole = "agent";
    }

    // Customer
    else if (req.user) {
      senderId = req.user.id;
      senderRole = "user";
    }

    else {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Customer can only message own ticket
    if (
      senderRole === "user" &&
      ticket.customer.toString() !== senderId
    ) {
      return res.status(403).json({
        message: "You cannot message this ticket",
      });
    }

    // Agent can only message assigned ticket
    if (
      senderRole === "agent" &&
      (!ticket.agent ||
        ticket.agent.toString() !== senderId)
    ) {
      return res.status(403).json({
        message: "This ticket is not assigned to you",
      });
    }

    const newMessage = await Message.create({
      ticket: ticketId,
      sender: senderId,
      senderRole,
      message: message.trim(),
    });

    const io = req.app.get("io");
    if (io) {
      io.to(ticketId).emit("newMessage", newMessage);
      io.emit("newMessage", newMessage);
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });

  } catch (error) {
    console.error("Send message error:", error);

    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};


// GET TICKET MESSAGES
export const getTicketMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    let userId;
    let role;

    if (req.agent) {
      userId = req.agent.id;
      role = "agent";
    } else if (req.user) {
      userId = req.user.id;
      role = "user";
    } else {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Customer access check
    if (
      role === "user" &&
      ticket.customer.toString() !== userId
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Agent access check
    if (
      role === "agent" &&
      (!ticket.agent ||
        ticket.agent.toString() !== userId)
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const messages = await Message.find({
      ticket: ticketId,
    })
      .sort({ createdAt: 1 });

    res.status(200).json({
      messages,
    });

  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      message: "Failed to get messages",
      error: error.message,
    });
  }
};
