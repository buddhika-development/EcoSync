// ✅ Open/Closed Principle: can easily extend color logic without modifying the core component
import React from "react";

type Status = "Pending" | "Scheduled" | "Completed" | "Cancelled";

interface BadgeProps {
  status: Status;
}

const colorMap: Record<Status, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const Badge: React.FC<BadgeProps> = ({ status }) => (
  <span
    className={`px-3 py-1 text-xs font-semibold rounded-full ${colorMap[status]}`}
  >
    {status}
  </span>
);

export default Badge;
