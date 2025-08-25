// src/pages/api/admin/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { User } from '@/models'; // import your User model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    if (method === 'POST') {
      // ----- Admin login -----
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

      const admin = await User.findOne({ where: { email, role: 'admin' } });
      if (!admin) return res.status(401).json({ message: 'Admin not found' });

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) return res.status(401).json({ message: 'Invalid password' });

      return res.status(200).json({ message: 'Login successful', adminId: admin.id });

    } else if (method === 'GET') {
      // ----- Fetch all registered users -----
      const users = await User.findAll({ where: { role: 'user' } });
      return res.status(200).json(users);

    } else if (method === 'PATCH') {
      // ----- Approve a user -----
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: 'Missing userId' });

      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.isApproved = true;
      await user.save();

      return res.status(200).json({ message: 'User approved', user });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
