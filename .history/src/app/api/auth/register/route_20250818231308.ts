import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { User } from "@/models"; // Make sure your User model is imported correctly

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",      // default role
      isActive: true,    // default active
    });

    // Return success (without password)
    const { password: _, ...userData } = newUser.toJSON();
    return res.status(201).json({ message: "User registered successfully", user: userData });

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
