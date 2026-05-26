import React from 'react';

interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      className={`notification ${type}`}
      id="notification"
      role={role}
      aria-live={ariaLive}
    >
      <span id="notification-text">{message}</span>
    </div>
  );
};

export default Notification;
