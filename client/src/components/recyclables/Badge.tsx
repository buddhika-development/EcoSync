// ✅ Open/Closed Principle: can easily extend color logic without modifying the core component
import React from "react";

type Status = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface BadgeProps {
  status: Status;
}

const colorMap: Record<Status, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const displayMap: Record<Status, string> = {
  PENDING: "Pending",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const Badge: React.FC<BadgeProps> = ({ status }) => (
  <span
    className={`px-3 py-1 text-xs font-semibold rounded-full ${colorMap[status]}`}
  >
    {displayMap[status]}
  </span>
);

export default Badge;
