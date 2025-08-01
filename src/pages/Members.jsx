import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Members.css';
import {
  EnvelopeIcon,
  PhoneIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

import { UserCircleIcon } from "@heroicons/react/24/solid";

export default function Members() {
  const navigate = useNavigate();
  
  const [members, setMembers] = useState([
    { id: "1", name: "Maria Silva", role: "Marketing", email: "maria@exemplo.com", phone: "(11) 98765-4321" },
    { id: "2", name: "João Santos", role: "Vendas", email: "joao@exemplo.com", phone: "(11) 91234-5678" },
    { id: "3", name: "Ana Oliveira", role: "RH", email: "ana@exemplo.com", phone: "(11) 99876-5432" },
    { id: "4", name: "Carlos Mendes", role: "Financeiro", email: "carlos@exemplo.com", phone: "(11) 95678-1234" },
    { id: "5", name: "Fernanda Lima", role: "TI", email: "fernanda@exemplo.com", phone: "(11) 94321-8765" },
  ]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "", phone: "" });

  const userName = localStorage.getItem('eventUserName');

  
  const filteredMembers = members.filter((m) =>
    [m.name, m.role, m.email].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleSave = () => {
    if (!newMember.name || !newMember.role) {
      alert("Nome e função são obrigatórios!");
      return;
    }
    if (editing) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editing.id ? { ...newMember, id: editing.id } : m))
      );
    } else {
      const id = Date.now().toString();
      setMembers((prev) => [...prev, { ...newMember, id }]);
    }
    setNewMember({ name: "", role: "", email: "", phone: "" });
    setEditing(null);
    setShowModal(false);
  };

  const handleEdit = (member) => {
    setNewMember(member);
    setEditing(member);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Deseja remover este membro?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="members-container">
      <header className="members-header">
        <button className="members-back-button" onClick={() => navigate("/")}>←</button>
        <h1>Gerenciar Membros</h1>
      </header>

      {userName && (
        <div className="user-login-bar">
          <span className="logged-user" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCircleIcon style={{ width: '24px', height: '24px', color: '#555' }} />
              Logado como: <strong>{userName}</strong> 
            </span>
            <button
              className="switch-user-button"
              onClick={() => {
              localStorage.removeItem('eventUserName');
              window.location.reload();
                                      }}
                                    >
                              Trocar
                      </button>
                </div>
              )}

      <div className="members-content">
        <div className="members-section-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar membros..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="add-member-button"
          >
            +
          </button>
        </div>

        <div className="members-list">
          {filteredMembers.length ? (
            filteredMembers.map((m) => (
              <div key={m.id} className="member-card">
                <div className="member-info">
                  <div className="member-avatar">
                    {m.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                  </div>
                  <div className="member-details">
                    <p className="member-name">{m.name}</p>
                    <p className="member-role">{m.role}</p>
                    <div className="member-contact">
                      <p className="contact-item">
                        <EnvelopeIcon className="icon" /> {m.email}
                      </p>
                      <p className="contact-item">
                        <PhoneIcon className="icon" /> {m.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="member-actions">
                  <button
                    onClick={() => handleEdit(m)}
                      className="action-button edit-button">                                      
                        <PencilSquareIcon className="icon" /> Editar
                  </button>
                  <button
                     onClick={() => handleDelete(m.id)}
                      className="action-button delete-button">
                        <TrashIcon className="icon" /> Remover
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p className="empty-state-icon">😔</p>
              <p className="empty-state-text">
                Nenhum membro encontrado.
              </p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">
                  {editing ? "Editar Membro" : "Adicionar Membro"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                    setNewMember({ name: "", role: "", email: "", phone: "" });
                  }}
                  className="modal-close"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nome <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Função <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  />
                </div>

                <div className="form-actions">
                  <button
                    onClick={handleSave}
                    className="submit-button"
                  >
                    {editing ? "Salvar Alterações" : "Adicionar Membro"}
                  </button>
                  <p className="form-note">* Campos obrigatórios</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}