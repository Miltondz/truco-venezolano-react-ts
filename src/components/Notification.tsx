import React from 'react';

interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  return (
    <div className={`notification ${type}`} id="notification">
      <span id="notification-text">{message}</span>
    </div>
  );
};

export default Notification;