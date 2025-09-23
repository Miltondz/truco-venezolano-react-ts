import React from 'react';

interface AchievementPopupProps {
  icon: string;
  title: string;
  description: string;
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ icon, title, description, onClose }) => {
  return (
    <div className="achievement show" id="achievement">
      <div className="achievement-icon" id="achievement-icon">{icon}</div>
      <div className="achievement-title" id="achievement-title">{title}</div>
      <div className="achievement-description" id="achievement-description">{description}</div>
    </div>
  );
};

export default AchievementPopup;