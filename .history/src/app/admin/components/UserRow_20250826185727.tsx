"use client";

import { motion } from "framer-motion";
import { Check, X, Edit2, Trash2 } from "lucide-react";
import useAdminData, { User } from "../hooks/useAdminData";

export default function UserRow({ user }: { user: User }) {
  const { approveUser, rejectUser, deleteUser, editUser } = useAdminData();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="grid grid-cols-12 items-center gap-2 px-3 py-3 hover:bg-wh
