import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';

// Native <dialog>: focus trap, Esc to close, inert background and focus return
// come from the browser. Clicking the backdrop also closes it.
export default function Modal({ open, onClose, labelledBy, className = '', children }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  return createPortal(
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="modal__inner">
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
          {children}
        </div>
      )}
    </dialog>,
    document.body,
  );
}
