import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

export function authenticateRequest(request, response, next) {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return response.status(401).json({ error: "Authentication required" });
  }

  try {
    request.auth = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired token" });
  }
}
