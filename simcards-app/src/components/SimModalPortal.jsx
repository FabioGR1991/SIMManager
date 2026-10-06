import { createPortal } from 'react-dom';

export default function SimModalPortal({ children, onBackdropMouseDown }) {
  return createPortal(
    <div
      className="sim-inventory-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onBackdropMouseDown?.(event);
      }}
    >
      {children}
    </div>,
    document.body
  );
}
