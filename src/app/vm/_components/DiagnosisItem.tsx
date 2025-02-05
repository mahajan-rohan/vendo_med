import React from "react";

interface DiagnosisItemProps {
  label: string;
  value: string;
}

const DiagnosisItem: React.FC<DiagnosisItemProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
};

export default DiagnosisItem;
