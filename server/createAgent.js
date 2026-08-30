import dotenv from "dotenv";
import bcrypt from "bcrypt";

import connectDB from "./config/db.js";
import Agent from "./model/AgentModel.js";

dotenv.config();

const createAgent = async () => {
  try {
    await connectDB();

    const existingAgent = await Agent.findOne({
      email: "agent@test.com",
    });

    if (existingAgent) {
      console.log("Agent already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "123456",
      10
    );

    const agent = await Agent.create({
      name: "Support Agent",
      email: "agent@test.com",
      password: hashedPassword,
      role: "agent",
      isActive: true,
    });

    console.log("Agent created successfully");
    console.log("Agent ID:", agent._id);
    console.log("Email:", agent.email);

    process.exit(0);
  } catch (error) {
    console.error("Agent creation failed:", error);
    process.exit(1);
  }
};

createAgent();
