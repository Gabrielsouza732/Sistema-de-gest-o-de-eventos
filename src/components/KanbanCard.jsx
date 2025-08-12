// KanbanCard.jsx
// KanbanCard.jsx
import "./KanbanCard.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState, useEffect } from "react";
import {
  updateEvent,
  deleteEvent,
  fetchUsers,
  fetchChecklistItems,
  updateChecklistItem,
  createChecklistItem,
  deleteChecklistItem,
  fetchComments,
  addComment,
  notifyAssignment,
} from "../services/api";

import { useUser } from "../contexts/UserContext";
import {
  CalendarDaysIcon,
  UserIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const CHECKLIST_TEMPLATES = {
  Conferência: ["Definir palestrantes", "Reservar auditório", "Preparar material promocional"],
  Workshop: ["Confirmar instrutor", "Criar lista de participantes", "Organizar coffee break"],
  Festa: ["Definir playlist", "Contratar buffet", "Decorar o espaço"],
  __default: ["Definir orçamento", "Montar cronograma", "Confirmar local"],
};

export default function KanbanCard({ event, column, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: event.id });
  const { currentUser } = useUser();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de edição por campo
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(event.title);

  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editedStartDate, setEditedStartDate] = useState(event.startDate);
  const [editedEndDate, setEditedEndDate] = useState(event.endDate);

  const [isEditingResponsible, setIsEditingResponsible] = useState(false);
  const [editedResponsible, setEditedResponsible] = useState(event.responsible || "");

  const [isEditingOrganizer, setIsEditingOrganizer] = useState(false);
  const [editedOrganizer, setEditedOrganizer] = useState(event.organizer || "");

  // FIX: boolean, não string
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [editedLocal, setEditedLocal] = useState(event.local || "");

  const [isEditingType, setIsEditingType] = useState(false);
  const [editedType, setEditedType] = useState(event.type || "");

  const [isEditingFormat, setIsEditingFormat] = useState(false);
  const [editedFormat, setEditedFormat] = useState(event.format || "");

  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [editedPriority, setEditedPriority] = useState(event.priority || "");

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editedBudget, setEditedBudget] = useState(event.estimatedBudget || "");

  const [isEditingParticipants, setIsEditingParticipants] = useState(false);
  const [editedParticipants, setEditedParticipants] = useState(event.participants || "");

  const [isEditingCostCenter, setIsEditingCostCenter] = useState(false);
  const [editedCostCenter, setEditedCostCenter] = useState(event.costCenter || "");

  // Descrição
  const [descriptionExpanded, setDescriptionExpanded] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(event.description || "");

  // Checklist e comentários
  const [checklistExpanded, setChecklistExpanded] = useState(true);
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newChecklistResponsibleId, setNewChecklistResponsibleId] = useState("");

  const [commentsExpanded, setCommentsExpanded] = useState(true);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");

  // Membros/equipe
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers().then(setUsers);

    (async () => {
      const data = await fetchChecklistItems(event.id);
      setChecklistItems(data);

      if (Array.isArray(data) && data.length === 0) {
        const texts = CHECKLIST_TEMPLATES[event.type] || CHECKLIST_TEMPLATES.__default;
        if (texts?.length) {
          const created = await Promise.all(
            texts.map((text) => createChecklistItem({ eventId: event.id, text }))
          );
          setChecklistItems(created);
        }
      }
    })();

    fetchComments(event.id).then(setComments);
  }, [event.id, event.type]);

  // Checklist
  const handleAddChecklist = async () => {
    if (!newChecklistText.trim()) return;

    const item = await createChecklistItem({
      eventId: event.id,
      text: newChecklistText,
      responsibleId: newChecklistResponsibleId || null,
    });

    setChecklistItems((items) => [...items, item]);
    setNewChecklistText("");
    setNewChecklistResponsibleId("");
  };

  const handleToggleChecklist = async (item) => {
    await updateChecklistItem(item.id, { done: !item.done });
    setChecklistItems((items) => items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)));
  };

  const handleDeleteChecklist = async (item) => {
    await deleteChecklistItem(item.id);
    setChecklistItems((items) => items.filter((i) => i.id !== item.id));
  };

  const handleChangeChecklistResponsible = async (item, userId) => {
    const payload = { responsibleId: userId || null };
    const updated = await updateChecklistItem(item.id, payload);

    setChecklistItems((items) => items.map((i) => (i.id === item.id ? { ...i, ...updated } : i)));

    if (userId) {
      try {
        await notifyAssignment(item.id);
      } catch (e) {
        console.error("Falha ao notificar atribuição:", e);
      }
    }
  };

  // Comentários
  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    const comment = await addComment(event.id, { text: newCommentText });
    setComments((prev) => [...prev, comment]);
    setNewCommentText("");
  };

  // Atualizar campo no backend
  const handleUpdateField = async (field, value) => {
    try {
      await updateEvent(event.id, { [field]: value });
    } catch (err) {
      alert("Erro ao atualizar campo!");
    }
  };

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");
  const handleKey = (e, onSave, onCancel) => {
    if (e.key === "Enter") onSave();
    if (e.key === "Escape") onCancel?.();
  };

  const saveField = async (field, value, endEdit) => {
    try {
      await handleUpdateField(field, value);
    } finally {
      endEdit(false);
    }
  };

  const saveDates = async () => {
    try {
      await handleUpdateField("startDate", editedStartDate);
      await handleUpdateField("endDate", editedEndDate);
    } finally {
      setIsEditingDate(false);
    }
  };

  return (
    <>
      {/* Card resumido */}
      <div
        ref={setNodeRef}
        style={style}
        className={`kanban-card ${column}`}
        {...attributes}
        {...listeners}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="card-header">
          {isEditingTitle ? (
            <input
              value={editedTitle}
              autoFocus
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                if (editedTitle !== event.title) handleUpdateField("title", editedTitle);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingTitle(false);
                  if (editedTitle !== event.title) handleUpdateField("title", editedTitle);
                }
              }}
              className="card-title-input"
            />
          ) : (
            <h3
              className="card-title"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
            >
              {editedTitle}
            </h3>
          )}

          {/* Botão de deletar */}
          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Deseja realmente excluir este evento?")) {
                deleteEvent(event.id);
                if (onDelete) onDelete(event.id);
                setIsModalOpen(false);
              }
            }}
            title="Excluir evento"
          >
            <TrashIcon style={{ width: 20, color: "#d33" }} />
          </button>

          <button
            className="close-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
            title="Fechar"
          >
            <XMarkIcon style={{ width: 20 }} />
          </button>
        </div>
      </div>

      {/* Modal de detalhes */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header-v2">
              <h2 className="modal-title-v2">{editedTitle}</h2>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>
                <XMarkIcon style={{ width: 22 }} />
              </button>
            </div>

            {/* Informações principais */}
            <div className="modal-grid-v2">
              {/* Datas */}
              <div onDoubleClick={() => setIsEditingDate(true)}>
                <CalendarDaysIcon className="info-icon" />
                {isEditingDate ? (
                  <div>
                    <input
                      type="date"
                      value={toInputDate(editedStartDate)}
                      onChange={(e) => setEditedStartDate(e.target.value)}
                      onKeyDown={(e) => handleKey(e, saveDates, () => setIsEditingDate(false))}
                      style={{ marginRight: 6 }}
                    />
                    <span> - </span>
                    <input
                      type="date"
                      value={toInputDate(editedEndDate)}
                      onChange={(e) => setEditedEndDate(e.target.value)}
                      onBlur={saveDates}
                      onKeyDown={(e) => handleKey(e, saveDates, () => setIsEditingDate(false))}
                      style={{ marginLeft: 6 }}
                    />
                  </div>
                ) : (
                  <span>
                    {formatDate(editedStartDate)} - {formatDate(editedEndDate)}
                  </span>
                )}
              </div>

              {/* Responsável */}
              <div onDoubleClick={() => setIsEditingResponsible(true)}>
                <UserIcon className="info-icon" />
                {isEditingResponsible ? (
                  <input
                    autoFocus
                    value={editedResponsible}
                    onChange={(e) => setEditedResponsible(e.target.value)}
                    onBlur={() => saveField("responsible", editedResponsible, setIsEditingResponsible)}
                    onKeyDown={(e) =>
                      handleKey(
                        e,
                        () => saveField("responsible", editedResponsible, setIsEditingResponsible),
                        () => setIsEditingResponsible(false)
                      )
                    }
                  />
                ) : (
                  <span>
                    <b>Responsável:</b> {editedResponsible || "N/A"}
                  </span>
                )}
              </div>

              {/* Organizador */}
              <div onDoubleClick={() => setIsEditingOrganizer(true)}>
                <UsersIcon className="info-icon" />
                {isEditingOrganizer ? (
                  <input
                    autoFocus
                    value={editedOrganizer}
                    onChange={(e) => setEditedOrganizer(e.target.value)}
                    onBlur={() => saveField("organizer", editedOrganizer, setIsEditingOrganizer)}
                    onKeyDown={(e) =>
                      handleKey(
                        e,
                        () => saveField("organizer", editedOrganizer, setIsEditingOrganizer),
                        () => setIsEditingOrganizer(false)
                      )
                    }
                  />
                ) : (
                  <span>
                    <b>Organizador:</b> {editedOrganizer || "N/A"}
                  </span>
                )}
              </div>

              {/* Local */}
              <div onDoubleClick={() => setIsEditingLocal(true)}>
                <MapPinIcon className="info-icon" />
                {isEditingLocal ? (
                  <input
                    autoFocus
                    value={editedLocal}
                    onChange={(e) => setEditedLocal(e.target.value)}
                    onBlur={() => saveField("local", editedLocal, setIsEditingLocal)}
                    onKeyDown={(e) =>
                      handleKey(
                        e,
                        () => saveField("local", editedLocal, setIsEditingLocal),
                        () => setIsEditingLocal(false)
                      )
                    }
                  />
                ) : (
                  <span>
                    <b>Local:</b> {editedLocal || ""}
                  </span>
                )}
              </div>

              {/* Tipo */}
              <div onDoubleClick={() => setIsEditingType(true)}>
                <TagIcon className="info-icon" />
                {isEditingType ? (
                  <input
                    autoFocus
                    value={editedType}
                    onChange={(e) => setEditedType(e.target.value)}
                    onBlur={() => saveField("type", editedType, setIsEditingType)}
                    onKeyDown={(e) =>
                      handleKey(
                        e,
                        () => saveField("type", editedType, setIsEditingType),
                        () => setIsEditingType(false)
                      )
                    }
                  />
                ) : (
                  <span>
                    <b>Tipo:</b> {editedType || "N/A"}
                  </span>
                )}
              </div>

              {/* Formato */}
              <div onDoubleClick={() => setIsEditingFormat(true)}>
                <ComputerDesktopIcon className="info-icon" />
                {isEditingFormat ? (
                  <input
                    autoFocus
                    value={editedFormat}
                    onChange={(e) => setEditedFormat(e.target.value)}
                    onBlur={() => saveField("format", editedFormat, setIsEditingFormat)}
                    onKeyDown={(e) =>
                      handleKey(
                        e,
                        () => saveField("format", editedFormat, setIsEditingFormat),
                        () => setIsEditingFormat(false)
                      )
                    }
                  />
                ) : (
                  <span>
                    <b>Formato:</b> {editedFormat || "N/A"}
                  </span>
                )}
              </div>

              {/* Prioridade */}
              <div onDoubleClick={() => setIsEditingPriority(true)}>
                <ExclamationTriangleIcon className="info-icon" />
                {isEditingPriority ? (
                  <select
                    autoFocus
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value)}
                    onBlur={() => saveField("priority", editedPriority, setIsEditingPriority)}
                    onKeyDown={(e) =>
                      handleKey(
                        e,
                        () => saveField("priority", editedPriority, setIsEditingPriority),
                        () => setIsEditingPriority(false)
                      )
                    }
                  >
                    <option value="ALTA">ALTA</option>
                    <option value="MÉDIA">MÉDIA</option>
                    <option value="BAIXA">BAIXA</option>
                  </select>
                ) : (
                  <span>
                    <b>Prioridade:</b>{" "}
                    <span
                      style={{
                        color:
                          editedPriority === "ALTA"
                            ? "#d32f2f"
                            : editedPriority === "MÉDIA"
                            ? "#ed6c02"
                            : "#388e3c",
                        fontWeight: "bold",
                      }}
                    >
                      {editedPriority || "N/A"}
                    </span>
                  </span>
                )}
              </div>

              {/* Orçamento */}
              <div onDoubleClick={() => setIsEditingBudget(true)}>
                <CurrencyDollarIcon className="info-icon" />
                {isEditingBudget ? (
                  <input
                    autoFocus
                    type="number"
                    step="0.01"
                    value={editedBudget}
                    onChange={(e) => setEditedBudget(e.target.value)}
                    onBlur={() =>
                      saveField("estimatedBudget", Number(editedBudget) || 0, setIsEditingBudget)
                    }
                    onKeyDown={(e) =>
                      handleKey(
                        e,
                        () =>
                          saveField(
                            "estimatedBudget",
                            Number(editedBudget) || 0,
                            setIsEditingBudget
                          ),
                        () => setIsEditingBudget(false)
                      )
                    }
                  />
                ) : (
                  <span>
                    <b>Orçamento:</b>{" "}
                    {Number(editedBudget || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                )}
              </div>

              {/* Participantes */}
              <div onDoubleClick={() => setIsEditingParticipants(true)}>
                <UserGroupIcon className="info-icon" />
                {isEditingParticipants ? (
                  <input
                    autoFocus
                    type="number"
                    step="1"
                    value={editedParticipants}
                    onChange={(e) => setEditedParticipants(e.target.value)}
                    onBlur={() =>
                      saveField("participants", Number(editedParticipants) || 0, setIsEditingParticipants)
                    }
                    onKeyDown={(e) =>
                      handleKey(
                        e,
                        () =>
                          saveField(
                            "participants",
                            Number(editedParticipants) || 0,
                            setIsEditingParticipants
                          ),
                        () => setIsEditingParticipants(false)
                      )
                    }
                  />
                ) : (
                  <span>
                    <b>Participantes:</b> {editedParticipants || "N/A"}
                  </span>
                )}
              </div>

              {/* Centro de Custo */}
              <div onDoubleClick={() => setIsEditingCostCenter(true)}>
                <BuildingOfficeIcon className="info-icon" />
                {isEditingCostCenter ? (
                  <input
                    autoFocus
                    value={editedCostCenter}
                    onChange={(e) => setEditedCostCenter(e.target.value)}
                    onBlur={() => saveField("costCenter", editedCostCenter, setIsEditingCostCenter)}
                    onKeyDown={(e) =>
                      handleKey(
                        e,
                        () => saveField("costCenter", editedCostCenter, setIsEditingCostCenter),
                        () => setIsEditingCostCenter(false)
                      )
                    }
                  />
                ) : (
                  <span>
                    <b>Centro de Custo:</b> {editedCostCenter || "N/A"}
                  </span>
                )}
              </div>
            </div>

            {/* Descrição */}
            <section className="section-v2">
              <button
                className="section-title-v2"
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              >
                Descrição Completa
                <ChevronDownIcon
                  style={{
                    width: 20,
                    marginLeft: 10,
                    transform: descriptionExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {descriptionExpanded && (
                <div style={{ marginTop: 8 }}>
                  {isEditingDescription ? (
                    <textarea
                      value={editedDescription}
                      autoFocus
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onBlur={() => {
                        setIsEditingDescription(false);
                        if (editedDescription !== event.description)
                          handleUpdateField("description", editedDescription);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          setIsEditingDescription(false);
                          if (editedDescription !== event.description)
                            handleUpdateField("description", editedDescription);
                        }
                      }}
                      className="description-textarea-v2"
                    />
                  ) : (
                    <div
                      className="description-view-v2"
                      onDoubleClick={() => setIsEditingDescription(true)}
                    >
                      {editedDescription}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Checklist */}
            <section className="section-v2">
              <button
                className="section-title-v2"
                onClick={() => setChecklistExpanded((s) => !s)}
              >
                Check List
                <ChevronDownIcon
                  style={{
                    width: 20,
                    marginLeft: 10,
                    transform: checklistExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {checklistExpanded && (
                <>
                  <div className="checklist-list-v2">
                    {checklistItems.length === 0 && (
                      <div className="empty-message-v2">Nenhum item no checklist.</div>
                    )}

                    {checklistItems.map((item) => {
                      const currentResponsibleId =
                        item.responsibleId || item.responsibleUser?.id || "";
                      const currentResponsibleName =
                        item.responsibleUser?.name || item.responsible || "";

                      return (
                        <label className="checklist-item-v2" key={item.id}>
                          <input
                            type="checkbox"
                            checked={!!item.done}
                            onChange={() => handleToggleChecklist(item)}
                          />
                          <span className={item.done ? "checklist-done-v2" : ""}>{item.text}</span>

                          {/* Select de responsável por item */}
                          <select
                            className="assignee-select-inline"
                            value={currentResponsibleId}
                            onChange={(e) => handleChangeChecklistResponsible(item, e.target.value)}
                            title={
                              currentResponsibleName
                                ? `Atribuído a ${currentResponsibleName}`
                                : "Atribuir responsável"
                            }
                          >
                            <option value="">Sem responsável</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>

                          <button
                            className="delete-checklist-v2"
                            onClick={() => handleDeleteChecklist(item)}
                          >
                            ✕
                          </button>
                        </label>
                      );
                    })}
                  </div>

                  <div className="checklist-add-v2">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="Novo item"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddChecklist();
                      }}
                    />

                    {/* Select responsável novo item */}
                    <select
                      className="assignee-select"
                      value={newChecklistResponsibleId}
                      onChange={(e) => setNewChecklistResponsibleId(e.target.value)}
                      title="Atribuir responsável (opcional)"
                    >
                      <option value="">Atribuir (opcional)</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>

                    <button onClick={handleAddChecklist} className="add-btn-v2">
                      + Adicionar Item
                    </button>
                  </div>
                </>
              )}
            </section>

            {/* Comentários */}
            <section className="section-v2">
              <button
                className="section-title-v2"
                onClick={() => setCommentsExpanded((s) => !s)}
              >
                Comentários
                <ChevronDownIcon
                  style={{
                    width: 20,
                    marginLeft: 10,
                    transform: commentsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {commentsExpanded && (
                <>
                  <div className="comments-list-v2">
                    {comments.length === 0 && (
                      <div className="empty-message-v2">Nenhum comentário ainda.</div>
                    )}

                    {comments.map((comment) => (
                      <div className="comment-item-v2" key={comment.id}>
                        <div className="comment-avatar-v2">
                          {comment.author?.name?.[0] || "U"}
                        </div>
                        <div>
                          <div className="comment-author-v2">
                            {comment.author?.name || "Usuário"}{" "}
                            <span className="comment-date-v2">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="comment-text-v2">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="comment-add-v2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Adicionar comentário..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment();
                      }}
                    />
                    <button onClick={handleAddComment} className="add-btn-v2">
                      Comentar
                    </button>
                  </div>
                </>
              )}
            </section>

            {/* Membros */}
            <section className="section-v2">
              <div className="section-title-v2" style={{ cursor: "default" }}>
                <UsersIcon style={{ width: 18, marginRight: 6, verticalAlign: "middle" }} />
                Membros da Equipe
                <button className="add-member-btn-v2" style={{ float: "right" }}>
                  + Adicionar Membro
                </button>
              </div>

              <div className="members-list-v2">
                {users.map((user, i) => (
                  <div className="member-card-v2" key={user.id || i}>
                    <span className="member-avatar-v2">{user.name?.[0] || "U"}</span>
                    <div>
                      <div className="member-name-v2">{user.name}</div>
                      <div className="member-role-v2">{user.role || "Membro"}</div>
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <span className="empty-message-v2">Nenhum membro encontrado.</span>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
