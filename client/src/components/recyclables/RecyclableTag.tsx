// ✅ Single Responsibility: purely for rendering tags
import React from "react";

interface RecyclableTagProps {
  label: string;
}

const RecyclableTag: React.FC<RecyclableTagProps> = ({ label }) => (
  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
    {label}
  </span>
);

export default RecyclableTag;
