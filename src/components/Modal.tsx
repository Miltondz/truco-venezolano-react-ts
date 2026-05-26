import React, { useEffect, useRef } from 'react';

interface ModalProps {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, message, onConfirm, onCancel }) => {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstButtonRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div className="modal active" id="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        <div className="modal-title" id="modal-title">{title}</div>
        <div className="modal-text" id="modal-text">{message}</div>
        <div className="modal-buttons">
          <button ref={firstButtonRef} className="modal-button" id="modal-cancel" onClick={onCancel}>
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
