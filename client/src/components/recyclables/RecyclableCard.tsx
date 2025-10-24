// ✅ Single Responsibility: handles rendering of a single recyclable request card
// ✅ Dependency Inversion: depends on abstractions (props), not data fetching

import React from "react";
import { Calendar, Truck, Weight, MapPin } from "lucide-react";
import Badge from "./Badge";
import RecyclableTag from "./RecyclableTag";
import type { RecyclableRequest } from "@/types/recyclable";
import { RECYCLABLE_CATEGORY_LABELS, RECYCLABLE_TYPE_LABELS } from "@/types/recyclable";

type RecyclableCardProps = RecyclableRequest;

const RecyclableCard: React.FC<RecyclableCardProps> = ({
  id,
  createdAt,
  type,
  category,
  weight,
  status,
  area,
}) => {
  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get human-readable category label
  const categoryLabel = RECYCLABLE_CATEGORY_LABELS[category] || category;

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-5 w-full max-w-sm flex flex-col justify-between transition hover:shadow-md">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800 text-lg">
          #{id.slice(0, 8)}
        </h3>
        <Badge status={status} />
      </div>

      <div className="mt-3 space-y-2 text-gray-600 text-sm">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          Requested: {formatDate(createdAt)}
        </div>

        <div className="flex items-center gap-2">
          <RecyclableTag label={categoryLabel} />
        </div>

        <div className="flex items-center gap-2">
          <Truck size={16} />
          {RECYCLABLE_TYPE_LABELS[type]}
        </div>

        <div className="flex items-center gap-2">
          <Weight size={16} />
          {weight} kg
        </div>

        {area && (
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            {area.area_name}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecyclableCard;
