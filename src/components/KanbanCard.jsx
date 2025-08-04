import React, { useState, useEffect } from 'react';
import './KanbanCard.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateEvent, deleteEvent, fetchUsers, fetchChecklistItems, updateChecklistItem, createChecklistItem, deleteChecklistItem, fetchComments, addComment } from '../services/api';

import { useUser } from '../contexts/UserContext';
import { 
  CalendarDaysIcon,
  UserIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  PlusIcon,
  UserGroupIcon
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
  
  // Estados para seções expansíveis
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  // Estados para checklist
  const [checklistItems, setChecklistItems] = useState([]);
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  // Estados para usuários/membros
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Estados para comentários
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatDateRange = (startDate, endDate) => {
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    
    if (formattedStart === "N/A" && formattedEnd === "N/A") {
      return "N/A";
    } else if (formattedStart === "N/A") {
      return formattedEnd;
    } else if (formattedEnd === "N/A") {
      return formattedStart;
    } else {
      return `${formattedStart} - ${formattedEnd}`;
    }
  };

  const formatBudget = (budget) => {
    if (budget === undefined || budget === null || isNaN(Number(budget))) return "N/A";
    return Number(budget).toLocaleString("pt-BR", {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'alta': return '#e74c3c';
      case 'média': return '#f39c12';
      case 'baixa': return '#3498db';
      default: return '#95a5a6';
    }
  };

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (isModalOpen) {
      loadChecklistItems();
      loadUsers();
      loadComments();
    }
  }, [isModalOpen]);

  const loadChecklistItems = async () => {
    setLoadingChecklist(true);
    try {
      const items = await fetchChecklistItems(event.id);
      setChecklistItems(items);
    } catch (error) {
      console.error('Erro ao carregar checklist:', error);
      setChecklistItems([]);
    } finally {
      setLoadingChecklist(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await fetchUsers();
      setAvailableUsers(users);
      console.log('✅ 5 usuários carregados do backend');
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadComments = async () => {
  setLoadingComments(true);
  try {
    const fetchedComments = await fetchComments(event.id); // <--- Usar a API real
    setComments(fetchedComments);
  } catch (error) {
    console.error('Erro ao carregar comentários:', error);
    setComments([]);
  } finally {
    setLoadingComments(false);
  }
};

  const handleOpenModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = (e) => {
    if (e) e.stopPropagation();
    setIsModalOpen(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${event.title}"? Esta ação é irreversível.`)) {
      try {
        await deleteEvent(event.id);
        if (onDelete) onDelete(event.id);
        handleCloseModal();
        console.log(`✅ Evento "${event.title}" (${event.id}) excluído com sucesso.`);
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
        alert('Erro ao excluir evento. Tente novamente.');
      }
    }
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  const handleSaveTitle = async () => {
    try {
      await updateEvent(event.id, { title: editedTitle });
      setIsEditingTitle(false);
      console.log(`✅ Título do evento atualizado para: ${editedTitle}`);
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      setEditedTitle(event.title); // Reverter em caso de erro
    }
  };

  const handleKeyDown = (e, saveFunction, cancelFunction) => {
    if (e.key === 'Enter') {
      saveFunction();
    } else if (e.key === 'Escape') {
      cancelFunction();
      setIsEditingTitle(false);
    }
  };

  // Funções do Checklist
  const toggleChecklistItem = async (itemId) => {
    try {
      const item = checklistItems.find(i => i.id === itemId);
      const updatedItem = await updateChecklistItem(itemId, { 
        completed: !item.completed 
      });
      
      setChecklistItems(prev => 
        prev.map(i => i.id === itemId ? updatedItem : i)
      );
      
      console.log(`✅ Item do checklist ${updatedItem.completed ? 'marcado' : 'desmarcado'}: ${item.text}`);
    } catch (error) {
      console.error('Erro ao atualizar item do checklist:', error);
    }
  };

  const addChecklistItem = async () => {
    const newItemText = prompt('Digite o nome do novo item:');
    if (newItemText && newItemText.trim()) {
      try {
        const newItem = await createChecklistItem({
          eventId: event.id,
          text: newItemText.trim(),
          completed: false,
          responsibleId: null
        });
        
        setChecklistItems(prev => [...prev, newItem]);
        console.log(`✅ Novo item adicionado ao checklist: ${newItemText}`);
      } catch (error) {
        console.error('Erro ao adicionar item ao checklist:', error);
        alert('Erro ao adicionar item. Tente novamente.');
      }
    }
  };

  const removeChecklistItem = async (itemId) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      try {
        await deleteChecklistItem(itemId);
        setChecklistItems(prev => prev.filter(i => i.id !== itemId));
        console.log(`✅ Item removido do checklist`);
      } catch (error) {
        console.error('Erro ao remover item do checklist:', error);
        alert('Erro ao remover item. Tente novamente.');
      }
    }
  };

  const assignResponsible = async (itemId, userId) => {
    try {
      const updatedItem = await updateChecklistItem(itemId, { 
        responsibleId: userId 
      });
      
      setChecklistItems(prev => 
        prev.map(i => i.id === itemId ? updatedItem : i)
      );
      
      const user = availableUsers.find(u => u.id === userId);
      console.log(`✅ Responsável atribuído: ${user?.name} para item do checklist`);
    } catch (error) {
      console.error('Erro ao atribuir responsável:', error);
    }
  };

  // Funções dos Comentários
  const handleAddComment = async () => { // <--- Adicionar async
  if (newComment.trim()) {
    try {
      const createdComment = await addComment({ // <--- Usar a API real
        eventId: event.id,
        text: newComment.trim(),
        authorId: currentUser?.id || '1', // Usar o ID do usuário logado
      });
      
      setComments(prev => [...prev, createdComment]);
      setNewComment('');
      console.log(`✅ Comentário adicionado: ${newComment.trim()}`);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário. Tente novamente.');
    }
  }
};


  return (
    <>
      {/* Card compacto */}
      <div 
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`kanban-card ${column.toLowerCase().replace(" ", "-")}`}
      >
        {/* Header do Card */}
        <div className="card-header">
          <h4 className="card-title">{event.title}</h4>
          <button 
            className="card-expand-button"
            onClick={handleOpenModal}
            title="Expandir card"
          >
            ⤢
          </button>
        </div>

        {/* Informações principais */}
        <div className="card-info">
          <div className="info-item">
            <CalendarDaysIcon style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            <span className="info-label">Data:</span>
            <span className="info-value">{formatDateRange(event.startDate, event.endDate)}</span>
          </div>

          <div className="info-item">
            <UserIcon style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            <span className="info-label">Responsável:</span>
            <span className="info-value">{event.requester || 'N/A'}</span>
          </div>

          <div className="info-item">
            <ExclamationTriangleIcon style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            <span className="info-label">Status:</span>
            <span className="info-value">{event.status || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Modal renderizado FORA do card */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
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
              {/* Informações principais em grid */}
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <CalendarDaysIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Data:
                  </span>
                  <span className="modal-info-value">{formatDateRange(event.startDate, event.endDate)}</span>
                </div>
                
                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <UserIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Responsável:
                  </span>
                  <span className="modal-info-value">{event.requester || 'N/A'}</span>
                </div>

                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <UserIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Organizador:
                  </span>
                  <span className="modal-info-value">{event.organizer || 'N/A'}</span>
                </div>

                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <MapPinIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Local:
                  </span>
                  <span className="modal-info-value">{event.location || 'N/A'}</span>
                </div>

                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <TagIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Tipo:
                  </span>
                  <span className="modal-info-value">{event.eventType || 'N/A'}</span>
                </div>

                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <ComputerDesktopIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Formato:
                  </span>
                  <span className="modal-info-value">{event.eventFormat || 'N/A'}</span>
                </div>

                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <ExclamationTriangleIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Prioridade:
                  </span>
                  <span 
                    className="modal-priority-badge"
                    style={{ color: getPriorityColor(event.priority || 'Alta') }}
                  >
                    {event.priority || 'Alta'}
                  </span>
                </div>

                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <CurrencyDollarIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Orçamento:
                  </span>
                  <span className="modal-info-value">{formatBudget(event.estimatedBudget)}</span>
                </div>

                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <UsersIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Participantes:
                  </span>
                  <span className="modal-info-value">{event.estimatedAttendees || 'N/A'}</span>
                </div>

                <div className="modal-info-item">
                  <span className="modal-info-label">
                    <BuildingOfficeIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    Centro de Custo:
                  </span>
                  <span className="modal-info-value">{event.costCenter || 'N/A'}</span>
                </div>
              </div>

              {/* Seção de Descrição Expansível */}
              <button 
                className="modal-dropdown-header"
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              >
                <span className="modal-dropdown-title">Descrição Completa</span>
                <ChevronDownIcon
                  style={{ width: '16px', height: '16px' }}
                  className={`transition-transform duration-200 ${descriptionExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {descriptionExpanded && (
                <div className="modal-dropdown-content">
                  <p>{event.description || "Nenhuma descrição fornecida."}</p>
                  {event.notes && (
                    <div>
                      <strong>Observações:</strong>
                      <p>{event.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Seção de Checklist Expansível */}
              <button 
                className="modal-dropdown-header"
                onClick={() => setChecklistExpanded(!checklistExpanded)}
              >
                <span className="modal-dropdown-title">
                  <ClipboardDocumentListIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                  Checklist ({checklistItems.length} itens)
                </span>
                <ChevronDownIcon
                  style={{ width: '16px', height: '16px' }}
                  className={`transition-transform duration-200 ${checklistExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {checklistExpanded && (
                <div className="modal-dropdown-content">
                  {loadingChecklist ? (
                    <p>Carregando checklist...</p>
                  ) : (
                    <>
                      <div className="checklist-header">
                        <button 
                          className="add-checklist-item-button"
                          onClick={addChecklistItem}
                        >
                          <PlusIcon style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                          Adicionar Item
                        </button>
                      </div>
                      
                      {checklistItems.length === 0 ? (
                        <p>Nenhum item no checklist. Clique em "Adicionar Item" para começar.</p>
                      ) : (
                        <div className="checklist-items">
                          {checklistItems.map((item) => (
                            <div key={item.id} className="checklist-item">
                              <div className="checklist-item-main">
                                <button
                                  className={`checklist-checkbox ${item.completed ? 'completed' : ''}`}
                                  onClick={() => toggleChecklistItem(item.id)}
                                >
                                  {item.completed && <CheckCircleIcon style={{ width: '16px', height: '16px' }} />}
                                </button>
                                
                                <span className={`checklist-text ${item.completed ? 'completed' : ''}`}>
                                  {item.text}
                                </span>
                                
                                <div className="checklist-actions">
                                  {item.responsibleId && (
                                    <span className="responsible-badge">
                                      <UserIcon style={{ width: '14px', height: '14px', marginRight: '2px' }} />
                                      {availableUsers.find(u => u.id === item.responsibleId)?.name || 'Usuário'}
                                    </span>
                                  )}
                                  
                                  <select
                                    value={item.responsibleId || ''}
                                    onChange={(e) => assignResponsible(item.id, e.target.value || null)}
                                    className="responsible-select"
                                  >
                                    <option value="">Sem responsável</option>
                                    {availableUsers.map(user => (
                                      <option key={user.id} value={user.id}>
                                        {user.name}
                                      </option>
                                    ))}
                                  </select>
                                  
                                  <button
                                    className="remove-item-button"
                                    onClick={() => removeChecklistItem(item.id)}
                                    title="Remover item"
                                  >
                                    <TrashIcon style={{ width: '14px', height: '14px' }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Seção de Comentários Expansível */}
              <button 
                className="modal-dropdown-header"
                onClick={() => setCommentsExpanded(!commentsExpanded)}
              >
                <span className="modal-dropdown-title">
                  <ChatBubbleLeftRightIcon style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                  Comentários ({comments.length})
                </span>
                <ChevronDownIcon
                  style={{ width: '16px', height: '16px' }}
                  className={`transition-transform duration-200 ${commentsExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {commentsExpanded && (
                <div className="modal-dropdown-content">
                  {loadingComments ? (
                    <p>Carregando comentários...</p>
                  ) : (
                    <>
                      <div className="comments-list">
                        {comments.length === 0 ? (
                          <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.id} className="comment-item">
                              <div className="comment-header">
                                <strong>{comment.author}</strong>
                                <span className="comment-date">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="comment-text">{comment.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="add-comment">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Adicione um comentário..."
                          className="comment-input"
                          rows={3}
                        />
                        <button
                          onClick={handleAddComment}
                          className="add-comment-button"
                          disabled={!newComment.trim()}
                        >
                          Adicionar Comentário
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
