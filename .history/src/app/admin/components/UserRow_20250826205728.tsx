"use client";

import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserRowProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved: boolean;
  };
  onEdit: (user: any) => void;
  onApprove: (id: string, approve: boolean) => void;
  onDelete: (id: string) => void;
}

export default function UserRow({ user, onEdit, onApprove, onDelete }: UserRowProps) {
  return (
    <tr className="border-b">
      <td className="px-4 py-2">{user.name}</td>
      <td className="px-4 py-2">{user.email}</td>
      <td className="px-4 py-2">{user.role}</td>
      <td className="px-4 py-2">
        {user.isApproved ? (
          <span className="text-green-600">Approved</span>
        ) : (
          <span className="text-red-600">Pending</span>
        )}
      </td>
      <td className="px-4 py-2 flex gap-2">
        {/* ✏️ Edit */}
        <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
          <Pencil className="w-4 h-4" />
        </Button>

        {/* ✅ Approve */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onApprove(user.id, true)}
          disabled={user.isApproved}
        >
          <Check className="w-4 h-4" />
        </Button>

        {/* ❌ Reject */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onApprove(user.id, false)}
          disabled={!user.isApproved}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* 🗑 Delete */}
        <Button variant="destructive" size="sm" onClick={() => onDelete(user.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}
