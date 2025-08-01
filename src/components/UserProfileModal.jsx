import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import './UserProfileModal.css';

export default function UserProfileModal({ user, onClose, onSave }) {
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setEditedName(user.name);
    setEditedEmail(user.email);
    setErrors({});
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!editedName.trim()) {
      newErrors.name = "Nome é obrigatório.";
    }
    if (!editedEmail.trim()) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(editedEmail)) {
      newErrors.email = "Formato de email inválido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ name: editedName.trim(), email: editedEmail.trim() });
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="user-modal-backdrop" onClick={onClose}>
      <div className="user-modal-content" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="user-modal-header">
          <h2>Meu Perfil</h2>
          <button className="user-modal-close-button" onClick={onClose}>
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>
        <div className="user-modal-body">
          <div className="user-avatar-large">
            {user.initials}
          </div>
          <div className="user-form-group">
            <label htmlFor="userName">Nome:</label>
            <input
              type="text"
              id="userName"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>
          <div className="user-form-group">
            <label htmlFor="userEmail">Email:</label>
            <input
              type="email"
              id="userEmail"
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
        </div>
        <div className="user-modal-footer">
          <button className="user-modal-cancel-button" onClick={onClose}>Cancelar</button>
          <button className="user-modal-save-button" onClick={handleSave}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
