import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/models"; // Adjust if your User model path differs

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Get all unapproved users
    try {
      const users = await User.findAll({ where: { isApproved: false } });
      return res.status(200).json(users);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch users." });
    }
  }

  if (req.method === "POST") {
    // Approve a user
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    try {
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.isApproved = true;
      await user.save();

      return res.status(200).json({ message: "User approved", user });
    } catch (err) {
      return res.status(500).json({ error: "Failed to approve user" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
