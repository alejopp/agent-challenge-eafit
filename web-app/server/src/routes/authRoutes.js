import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { Router } from "express";
import { statements } from "../lib/db.js";
import { signToken, authenticateRequest } from "../lib/auth.js";

export const authRouter = Router();

authRouter.post("/register", async (request, response) => {
  const { name, password } = request.body;
  const email = String(request.body.email || "").trim().toLowerCase();

  if (!name || !email || !password) {
    return response.status(400).json({ error: "Name, email, and password are required" });
  }

  if (statements.findUserByEmail.get(email)) {
    return response.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  statements.createUser.run(user);
  const token = signToken(user);
  response.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

authRouter.post("/login", async (request, response) => {
  const { email, password } = request.body;
  const user = statements.findUserByEmail.get(String(email || "").trim().toLowerCase());

  if (!user) {
    return response.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password || "", user.passwordHash);
  if (!valid) {
    return response.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user);
  response.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

authRouter.get("/me", authenticateRequest, (request, response) => {
  const user = statements.findUserById.get(request.auth.sub);
  response.json({ user });
});
