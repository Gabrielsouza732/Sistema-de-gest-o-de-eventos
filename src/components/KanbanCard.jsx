import React, { useState, useEffect } from 'react';
import './KanbanCard.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateEvent, deleteEvent, fetchUsers } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { CalendarDaysIcon,
  UserIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon, // Importar o ícone de lixeira
  XMarkIcon, // Para o botão de fechar do modal
  Cog6ToothIcon // Para o botão de configurações do membro
} from '@heroicons/react/24/outline';

export default function KanbanCard({ event, column, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: event.id });
  const { currentUser } = useUser();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(event.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(event.description || "");

  // Estados para edição in-line de campos
  const [editedRequester, setEditedRequester] = useState(event.requester || "");
  const [isEditingRequester, setIsEditingRequester] = useState(false);
  const [editedOrganizer, setEditedOrganizer] = useState(event.organizer || "");
  const [isEditingOrganizer, setIsEditingOrganizer] = useState(false);
  const [editedLocation, setEditedLocation] = useState(event.location || "");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editedEventType, setEditedEventType] = useState(event.eventType || "");
  const [isEditingEventType, setIsEditingEventType] = useState(false);
  const [editedEventFormat, setEditedEventFormat] = useState(event.eventFormat || "");
  const [isEditingEventFormat, setIsEditingEventFormat] = useState(false);
  const [editedEstimatedBudget, setEditedEstimatedBudget] = useState(event.estimatedBudget || "");
  const [isEditingEstimatedBudget, setIsEditingEstimatedBudget] = useState(false);
  const [editedEstimatedAttendees, setEditedEstimatedAttendees] = useState(event.estimatedAttendees || "");
  const [isEditingEstimatedAttendees, setIsEditingEstimatedAttendees] = useState(false);
  const [editedCostCenter, setEditedCostCenter] = useState(event.costCenter || "");
  const [isEditingCostCenter, setIsEditingCostCenter] = useState(false);

  const [showChecklistDropdown, setShowChecklistDropdown] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");

  // ✅ NOVO: Estado aprimorado para checklist com responsáveis
  const [checklistItems, setChecklistItems] = useState([
    { id: 'budget', text: 'Orçamento', completed: false, responsible: null },
    { id: 'coffeebreak', text: 'Coffeebreak', completed: false, responsible: { name: 'João Santos', initials: 'JS' } },
    { id: 'organization', text: 'Organização', completed: false, responsible: null }
  ]);

  // ✅ NOVO: Lista de usuários carregada do backend
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [comments, setComments] = useState({
    [event.id]: [
      { id: '1', author: 'Maria Silva', text: 'Precisamos confirmar o palestrante principal até amanhã.', timestamp: '25/06/2025 14:30' },
      { id: '2', author: 'João Santos', text: 'Orçamento aprovado pela diretoria.', timestamp: '26/06/2025 09:15' }
    ]
  });

  // ✅ NOVO: Carregar usuários do backend
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingMembers(true);
        const users = await fetchUsers();
        
        // Transformar usuários para o formato esperado
        const formattedUsers = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.name.charAt(0).toUpperCase()
        }));
        
        setAvailableMembers(formattedUsers);
        console.log(`✅ ${formattedUsers.length} usuários carregados do backend`);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        // Fallback para lista padrão em caso de erro
        setAvailableMembers([
          { id: 'fallback-1', name: 'João Santos', initials: 'JS' },
          { id: 'fallback-2', name: 'Maria Silva', initials: 'MS' },
          { id: 'fallback-3', name: 'Pedro Costa', initials: 'PC' },
          { id: 'fallback-4', name: 'Ana Oliveira', initials: 'AO' }
        ]);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadUsers();
  }, []);

  const handleOpenModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setIsEditingRequester(false);
    setIsEditingOrganizer(false);
    setIsEditingLocation(false);
    setIsEditingEventType(false);
    setIsEditingEventFormat(false);
    setIsEditingEstimatedBudget(false);
    setIsEditingEstimatedAttendees(false);
    setIsEditingCostCenter(false);
    setShowChecklistDropdown(false);
    setShowMemberDropdown(false);
  };

  const handleUpdateEvent = async (field, value) => {
    try {
      const updatedEvent = await updateEvent(event.id, { [field]: value });
      console.log(`✅ Evento ${field} atualizado:`, updatedEvent);
      // Atualizar o estado local do evento no Kanban (se necessário, via prop ou context)
    } catch (error) {
      console.error(`Erro ao atualizar ${field} do evento:`, error);
      // Reverter o estado local em caso de erro
      if (field === 'title') setEditedTitle(event.title);
      if (field === 'description') setEditedDescription(event.description);
      if (field === 'requester') setEditedRequester(event.requester);
      if (field === 'organizer') setEditedOrganizer(event.organizer);
      if (field === 'location') setEditedLocation(event.location);
      if (field === 'eventType') setEditedEventType(event.eventType);
      if (field === 'eventFormat') setEditedEventFormat(event.eventFormat);
      if (field === 'estimatedBudget') setEditedEstimatedBudget(event.estimatedBudget);
      if (field === 'estimatedAttendees') setEditedEstimatedAttendees(event.estimatedAttendees);
      if (field === 'costCenter') setEditedCostCenter(event.costCenter);
      alert(`Erro ao atualizar ${field}.`);
    }
  };

  const handleTitleChange = (e) => setEditedTitle(e.target.value);
  const handleDescriptionChange = (e) => setEditedDescription(e.target.value);
  const handleRequesterChange = (e) => setEditedRequester(e.target.value);
  const handleOrganizerChange = (e) => setEditedOrganizer(e.target.value);
  const handleLocationChange = (e) => setEditedLocation(e.target.value);
  const handleEventTypeChange = (e) => setEditedEventType(e.target.value);
  const handleEventFormatChange = (e) => setEditedEventFormat(e.target.value);
  const handleEstimatedBudgetChange = (e) => setEditedEstimatedBudget(e.target.value);
  const handleEstimatedAttendeesChange = (e) => setEditedEstimatedAttendees(e.target.value);
  const handleCostCenterChange = (e) => setEditedCostCenter(e.target.value);

  const handleSaveTitle = () => {
    if (editedTitle.trim() !== event.title) {
      handleUpdateEvent('title', editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (editedDescription.trim() !== event.description) {
      handleUpdateEvent('description', editedDescription.trim());
    }
    setIsEditingDescription(false);
  };

  const handleSaveRequester = () => {
    if (editedRequester.trim() !== event.requester) {
      handleUpdateEvent('requester', editedRequester.trim());
    }
    setIsEditingRequester(false);
  };

  const handleSaveOrganizer = () => {
    if (editedOrganizer.trim() !== event.organizer) {
      handleUpdateEvent('organizer', editedOrganizer.trim());
    }
    setIsEditingOrganizer(false);
  };

  const handleSaveLocation = () => {
    if (editedLocation.trim() !== event.location) {
      handleUpdateEvent('location', editedLocation.trim());
    }
    setIsEditingLocation(false);
  };

  const handleSaveEventType = () => {
    if (editedEventType.trim() !== event.eventType) {
      handleUpdateEvent('eventType', editedEventType.trim());
    }
    setIsEditingEventType(false);
  };

  const handleSaveEventFormat = () => {
    if (editedEventFormat.trim() !== event.eventFormat) {
      handleUpdateEvent('eventFormat', editedEventFormat.trim());
    }
    setIsEditingEventFormat(false);
  };

  const handleSaveEstimatedBudget = () => {
    const newValue = parseFloat(editedEstimatedBudget);
    if (!isNaN(newValue) && newValue !== event.estimatedBudget) {
      handleUpdateEvent('estimatedBudget', newValue);
    }
    setIsEditingEstimatedBudget(false);
  };

  const handleSaveEstimatedAttendees = () => {
    const newValue = parseInt(editedEstimatedAttendees);
    if (!isNaN(newValue) && newValue !== event.estimatedAttendees) {
      handleUpdateEvent('estimatedAttendees', newValue);
    }
    setIsEditingEstimatedAttendees(false);
  };

  const handleSaveCostCenter = () => {
    if (editedCostCenter.trim() !== event.costCenter) {
      handleUpdateEvent('costCenter', editedCostCenter.trim());
    }
    setIsEditingCostCenter(false);
  };

  const handleKeyDown = (e, saveFunction, cancelFunction) => {
    if (e.key === 'Enter') {
      saveFunction();
    } else if (e.key === 'Escape') {
      cancelFunction();
    }
  };

  const toggleChecklistItem = (id) => {
    setChecklistItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addEventMember = (member) => {
    console.log(`Adicionando membro: ${member.name}`);
    // Lógica para adicionar o membro ao evento (ainda não integrada com o backend)
    // Por enquanto, apenas um log para demonstração
    // Em uma implementação real, você faria uma chamada de API aqui
  };

  const assignedMembers = checklistItems
    .filter(item => item.responsible)
    .map(item => item.responsible);

  const handleAddComment = () => {
    if (newComment.trim() && currentUser) {
      const newCommentObj = {
        id: Date.now().toString(), // ID temporário
        author: currentUser.name,
        authorId: currentUser.id,
        text: newComment.trim(),
        timestamp: new Date().toLocaleString('pt-BR'),
        createdAt: new Date().toISOString()
      };
      setComments(prevComments => ({
        ...prevComments,
        [event.id]: [...(prevComments[event.id] || []), newCommentObj]
      }));
      setNewComment('');
      console.log('💬 Comentário adicionado:', { evento: event.title, autor: currentUser.name, comentario: newComment.trim() });
    }
  };

  // ✅ NOVO: Função para lidar com a exclusão do evento
  const handleDeleteEvent = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${event.title}"? Esta ação é irreversível.`)) {
      try {
        await deleteEvent(event.id);
        onDelete(event.id); // Notifica o componente pai para remover o card
        handleCloseModal(); // Fecha o modal após a exclusão
        console.log(`✅ Evento "${event.title}" (${event.id}) excluído com sucesso.`);
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
        alert('Erro ao excluir evento. Tente novamente.');
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card ${column}`}
      onClick={handleOpenModal}
      title="Clique para expandir"
    >
      <h3>{event.title}</h3>
      <p>Status: {event.status}</p>
      {event.priority && <p>Prioridade: {event.priority}</p>}

      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header do Modal */}
            <div className="modal-header">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={handleTitleChange}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => handleKeyDown(e, handleSaveTitle, () => setEditedTitle(event.title))}
                  className="modal-title-input"
                  autoFocus
                />
              ) : (
                <h2 
                  className="modal-title"
                  onDoubleClick={() => setIsEditingTitle(true)}
                  title="Duplo clique para editar"
                >
                  {editedTitle || "Sem Título"}
                </h2>
              )}
              <div className="modal-actions">
                <button 
                  className="modal-delete-button" 
                  onClick={handleDeleteEvent} 
                  title="Excluir Evento"
                >
                  <TrashIcon style={{ width: '20px', height: '20px' }} />
                </button>
                <button 
                  className="modal-close-button" 
                  onClick={handleCloseModal} 
                  title="Fechar"
                >
                  <XMarkIcon style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>

            {/* Corpo do Modal */}
            <div className="modal-body">
              {/* Descrição */}
              <div className="modal-section">
                <h3 className="modal-section-title">Descrição</h3>
                {isEditingDescription ? (
                  <textarea
                    value={editedDescription}
                    onChange={handleDescriptionChange}
                    onBlur={handleSaveDescription}
                    onKeyDown={(e) => handleKeyDown(e, handleSaveDescription, () => setEditedDescription(event.description))}
                    className="modal-description-textarea"
                    autoFocus
                    rows="4"
                  />
                ) : (
                  <p 
                    className="modal-description"
                    onDoubleClick={() => setIsEditingDescription(true)}
                    title="Duplo clique para editar"
                  >
                    {editedDescription || "Nenhuma descrição fornecida."}
                  </p>
                )}
              </div>

              {/* Detalhes do Evento */}
              <div className="modal-section">
                <h3 className="modal-section-title">Detalhes do Evento</h3>
                <div className="modal-details-grid">
                  <div className="modal-detail-item">
                    <UserIcon className="modal-detail-icon" />
                    <span className="modal-detail-label">Responsável:</span>
                    {isEditingRequester ? (
                      <input
                        type="text"
                        value={editedRequester}
                        onChange={handleRequesterChange}
                        onBlur={handleSaveRequester}
                        onKeyDown={(e) => handleKeyDown(e, handleSaveRequester, () => setEditedRequester(event.requester))}
                        className="modal-detail-input"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="modal-detail-value"
                        onDoubleClick={() => setIsEditingRequester(true)}
                        title="Duplo clique para editar"
                      >
                        {editedRequester || "Não definido"}
                      </span>
                    )}
                  </div>
                  <div className="modal-detail-item">
                    <UserIcon className="modal-detail-icon" />
                    <span className="modal-detail-label">Organizador:</span>
                    {isEditingOrganizer ? (
                      <input
                        type="text"
                        value={editedOrganizer}
                        onChange={handleOrganizerChange}
                        onBlur={handleSaveOrganizer}
                        onKeyDown={(e) => handleKeyDown(e, handleSaveOrganizer, () => setEditedOrganizer(event.organizer))}
                        className="modal-detail-input"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="modal-detail-value"
                        onDoubleClick={() => setIsEditingOrganizer(true)}
                        title="Duplo clique para editar"
                      >
                        {editedOrganizer || "Não definido"}
                      </span>
                    )}
                  </div>
                  <div className="modal-detail-item">
                    <MapPinIcon className="modal-detail-icon" />
                    <span className="modal-detail-label">Local:</span>
                    {isEditingLocation ? (
                      <input
                        type="text"
                        value={editedLocation}
                        onChange={handleLocationChange}
                        onBlur={handleSaveLocation}
                        onKeyDown={(e) => handleKeyDown(e, handleSaveLocation, () => setEditedLocation(event.location))}
                        className="modal-detail-input"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="modal-detail-value"
                        onDoubleClick={() => setIsEditingLocation(true)}
                        title="Duplo clique para editar"
                      >
                        {editedLocation || "Não definido"}
                      </span>
                    )}
                  </div>
                  <div className="modal-detail-item">
                    <TagIcon className="modal-detail-icon" />
                    <span className="modal-detail-label">Tipo:</span>
                    {isEditingEventType ? (
                      <input
                        type="text"
                        value={editedEventType}
                        onChange={handleEventTypeChange}
                        onBlur={handleSaveEventType}
                        onKeyDown={(e) => handleKeyDown(e, handleSaveEventType, () => setEditedEventType(event.eventType))}
                        className="modal-detail-input"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="modal-detail-value"
                        onDoubleClick={() => setIsEditingEventType(true)}
                        title="Duplo clique para editar"
                      >
                        {editedEventType || "Não definido"}
                      </span>
                    )}
                  </div>
                  <div className="modal-detail-item">
                    <TagIcon className="modal-detail-icon" />
                    <span className="modal-detail-label">Formato:</span>
                    {isEditingEventFormat ? (
                      <input
                        type="text"
                        value={editedEventFormat}
                        onChange={handleEventFormatChange}
                        onBlur={handleSaveEventFormat}
                        onKeyDown={(e) => handleKeyDown(e, handleSaveEventFormat, () => setEditedEventFormat(event.eventFormat))}
                        className="modal-detail-input"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="modal-detail-value"
                        onDoubleClick={() => setIsEditingEventFormat(true)}
                        title="Duplo clique para editar"
                      >
                        {editedEventFormat || "Não definido"}
                      </span>
                    )}
                  </div>
                  <div className="modal-detail-item">
                    <CurrencyDollarIcon className="modal-detail-icon" />
                    <span className="modal-detail-label">Orçamento:</span>
                    {isEditingEstimatedBudget ? (
                      <input
                        type="number"
                        value={editedEstimatedBudget}
                        onChange={handleEstimatedBudgetChange}
                        onBlur={handleSaveEstimatedBudget}
                        onKeyDown={(e) => handleKeyDown(e, handleSaveEstimatedBudget, () => setEditedEstimatedBudget(event.estimatedBudget))}
                        className="modal-detail-input"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="modal-detail-value"
                        onDoubleClick={() => setIsEditingEstimatedBudget(true)}
                        title="Duplo clique para editar"
                      >
                        {editedEstimatedBudget ? `R$ ${parseFloat(editedEstimatedBudget).toFixed(2)}` : "Não definido"}
                      </span>
                    )}
                  </div>
                  <div className="modal-detail-item">
                    <UsersIcon className="modal-detail-icon" />
                    <span className="modal-detail-label">Participantes:</span>
                    {isEditingEstimatedAttendees ? (
                      <input
                        type="number"
                        value={editedEstimatedAttendees}
                        onChange={handleEstimatedAttendeesChange}
                        onBlur={handleSaveEstimatedAttendees}
                        onKeyDown={(e) => handleKeyDown(e, handleSaveEstimatedAttendees, () => setEditedEstimatedAttendees(event.estimatedAttendees))}
                        className="modal-detail-input"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="modal-detail-value"
                        onDoubleClick={() => setIsEditingEstimatedAttendees(true)}
                        title="Duplo clique para editar"
                      >
                        {editedEstimatedAttendees || "Não definido"}
                      </span>
                    )}
                  </div>
                  <div className="modal-detail-item">
                    <CurrencyDollarIcon className="modal-detail-icon" />
                    <span className="modal-detail-label">Centro de Custo:</span>
                    {isEditingCostCenter ? (
                      <input
                        type="text"
                        value={editedCostCenter}
                        onChange={handleCostCenterChange}
                        onBlur={handleSaveCostCenter}
                        onKeyDown={(e) => handleKeyDown(e, handleSaveCostCenter, () => setEditedCostCenter(event.costCenter))}
                        className="modal-detail-input"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="modal-detail-value"
                        onDoubleClick={() => setIsEditingCostCenter(true)}
                        title="Duplo clique para editar"
                      >
                        {editedCostCenter || "Não definido"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Membros */}
              <div className="modal-section">
                <h3 className="modal-section-title">Membros</h3>
                <div className="modal-members-list">
                  {assignedMembers.map((member, index) => (
                    <div key={index} className="modal-member-tag">
                      <div className="modal-member-avatar">{member.initials}</div>
                      <span>{member.name}</span>
                    </div>
                  ))}
                  <button 
                    className="modal-add-member-button"
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                  >
                    + Adicionar Membro
                  </button>
                  
                  {showMemberDropdown && (
                    <div className="modal-member-dropdown">
                      {loadingMembers ? (
                        <div className="modal-member-loading">
                          Carregando usuários...
                        </div>
                      ) : (
                        <>
                          {availableMembers
                            .filter(member => !assignedMembers.find(assigned => assigned.id === member.id))
                            .map(member => (
                              <div 
                                key={member.id} 
                                className="modal-member-option"
                                onClick={() => {
                                  addEventMember(member);
                                  setShowMemberDropdown(false);
                                }}
                              >
                                <div className="modal-member-avatar">
                                  {member.initials}
                                </div>
                                <div className="modal-member-info">
                                  <span className="modal-member-name">{member.name}</span>
                                  {member.email && (
                                    <span className="modal-member-email">{member.email}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          }
                          {!loadingMembers && availableMembers.filter(member => !assignedMembers.find(assigned => assigned.id === member.id)).length === 0 && (
                            <div className="modal-no-members">
                              Todos os usuários já foram adicionados
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist */}
              <div className="modal-section">
                <h3 className="modal-section-title">
                  Checklist
                  <button 
                    className="modal-expand-button"
                    onClick={() => setChecklistExpanded(!checklistExpanded)}
                  >
                    {checklistExpanded ? 'Esconder' : 'Expandir'}
                  </button>
                </h3>
                {checklistExpanded && (
                  <div className="modal-checklist-items">
                    {checklistItems.map(item => (
                      <div key={item.id} className="modal-checklist-item">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(item.id)}
                        />
                        <span>{item.text}</span>
                        {item.responsible && (
                          <span className="modal-checklist-responsible">
                            ({item.responsible.name})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comentários */}
              <div className="modal-section">
                <h3 className="modal-section-title">
                  Comentários
                  <button 
                    className="modal-expand-button"
                    onClick={() => setCommentsExpanded(!commentsExpanded)}
                  >
                    {commentsExpanded ? 'Esconder' : 'Expandir'}
                  </button>
                </h3>
                {commentsExpanded && (
                  <div className="modal-dropdown-content">
                    {/* Área de adicionar comentário */}
                    <div className="add-comment-section">
                      <div className="comment-input-container">
                        <div className="comment-avatar">
                          {currentUser ? currentUser.initials : 'U'}
                        </div>
                        <textarea
                          className="comment-input"
                          placeholder="Escreva um comentário..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows="3"
                        />
                      </div>
                      <button 
                        className="add-comment-button"
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || !currentUser}
                      >
                        Comentar
                      </button>
                    </div>

                    {/* Lista de comentários */}
                    <div className="comments-list">
                      {comments[event.id] && comments[event.id].length > 0 ? (
                        comments[event.id].map((comment, index) => (
                          <div key={index} className="comment-item">
                            <div className="comment-avatar">{comment.author.charAt(0).toUpperCase()}</div>
                            <div className="comment-content">
                              <span className="comment-author">{comment.author}</span>
                              <span className="comment-timestamp">{comment.timestamp}</span>
                              <p className="comment-text">{comment.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-comments">Nenhum comentário ainda.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
