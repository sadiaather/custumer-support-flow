import jwt from "jsonwebtoken";

const secret = process.env.secret

const agentMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      secret
    );
 console.log("Decoded Agent:", decoded);
    if (decoded.role !== "agent") {
      return res.status(403).json({
        message: "Access denied. Agent only.",
      });
    }

    req.agent = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired agent token",
    });
  }
};

export default agentMiddleware
