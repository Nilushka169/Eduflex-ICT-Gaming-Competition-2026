import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">⚠️</div>
        <h3>Confirm Reset</h3>
        <p>{message}</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Reset All Data</button>
        </div>
      </div>
    </div>
  );
}
