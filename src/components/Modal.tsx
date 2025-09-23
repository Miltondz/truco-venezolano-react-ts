import React from 'react';

interface ModalProps {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="modal active" id="confirm-modal">
      <div className="modal-content">
        <div className="modal-title" id="modal-title">{title}</div>
        <div className="modal-text" id="modal-text">{message}</div>
        <div className="modal-buttons">
          <button className="modal-button" id="modal-cancel" onClick={onCancel}>
            Cancelar
          </button>
          {onConfirm && (
            <button className="modal-button primary" id="modal-confirm" onClick={onConfirm}>
              Confirmar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;