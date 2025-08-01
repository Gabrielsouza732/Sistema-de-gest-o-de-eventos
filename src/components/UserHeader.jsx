import React, { useState } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext';
import UserProfileModal from './UserProfileModal';
import './UserHeader.css';

export default function UserHeader() {
  const { currentUser, updateUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveUser = (newUserData) => {
    updateUser(newUserData);
  };

  if (!currentUser) {
    return (
      <div className="user-header-container loading">
        <div className="user-avatar loading"></div>
        <div className="user-info">
          <span className="user-name loading"></span>
          <span className="user-email loading"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-header-container">
      <div className="user-avatar">
        {currentUser.initials}
      </div>
      <div className="user-info">
        <span className="user-name">{currentUser.name}</span>
        <span className="user-email">{currentUser.email}</span>
      </div>
      <button className="user-settings-button" onClick={handleOpenModal} title="Configurações do Perfil">
        <Cog6ToothIcon style={{ width: '20px', height: '20px' }} />
      </button>

      {isModalOpen && (
        <UserProfileModal
          user={currentUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}
