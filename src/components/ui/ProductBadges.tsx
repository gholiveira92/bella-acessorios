"use client";

import { FiHeart, FiStar, FiAward, FiShield } from "react-icons/fi";

export default function ProductBadges() {
  const badges = [
    { icon: FiHeart, label: "Antialérgico" },
    { icon: FiStar, label: "Acabamento Premium" },
    { icon: FiAward, label: "Qualidade Garantida" },
    { icon: FiShield, label: "Banho de Ouro 18k" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map((badge, idx) => (
        <div 
          key={idx} 
          className="flex items-center gap-2 p-3 bg-brand-bg-light rounded-lg"
        >
          <badge.icon className="text-brand-gold flex-shrink-0" size={16} />
          <span className="font-sans text-xs text-text-secondary">{badge.label}</span>
        </div>
      ))}
    </div>
  );
}