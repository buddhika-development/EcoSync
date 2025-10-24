// ✅ Single Responsibility: handles rendering of a single recyclable request card
// ✅ Dependency Inversion: depends on abstractions (props), not data fetching

import React from "react";
import { Calendar, Truck, Weight } from "lucide-react";
import Badge from "./Badge";
import RecyclableTag from "./RecyclableTag";

interface RecyclableCardProps {
  id: string;
  requestedDate: string;
  type: string;
  category: string[];
  weight: number;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
}

const RecyclableCard: React.FC<RecyclableCardProps> = ({
  id,
  requestedDate,
  type,
  category,
  weight,
  status,
}) => {
  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-5 w-full max-w-sm flex flex-col justify-between transition hover:shadow-md">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800 text-lg">{id}</h3>
        <Badge status={status} />
      </div>

      <div className="mt-3 space-y-2 text-gray-600 text-sm">
        <div className="flex items-center gap-2">
          <Calendar size={16} /> Requested at {requestedDate}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {category.map((c) => (
            <RecyclableTag key={c} label={c} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Truck size={16} /> {type}
        </div>
        <div className="flex items-center gap-2">
          <Weight size={16} /> Approx. {weight} kg
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} /> Collected at {requestedDate}
        </div>
      </div>

      
    </div>
  );
};

export default RecyclableCard;
