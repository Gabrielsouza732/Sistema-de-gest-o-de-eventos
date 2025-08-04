import React, { useState, useEffect } from "react";
import "../styles/Kanban.css";
import { useNavigate } from "react-router-dom";
import KanbanCard from "../components/KanbanCard";
import SearchFilter from "../components/SearchFilter";
import UserHeader from "../components/UserHeader"; // Importar UserHeader
import { UserProvider } from "../contexts/UserContext"; // Importar UserProvider
import { fetchEvents, updateEventStatus } from "../services/api";

import {
  DndContext,
  closestCorners,
  useSensors,
  PointerSensor,
  useSensor,
  DragOverlay,
  useDroppable
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// Componente para área de drop em colunas vazias
function DroppableColumn({ children, id }) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef} className="droppable-column">
      {children}
    </div>
  );
}

export default function Kanban() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [eventsState, setEventsState] = useState({
    pending: [],
    inProgress: [],
    completed: [],
  });
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchEvents();

        const grouped = {
          pending: data.filter((event) => event.status === "Aguardando"),
          inProgress: data.filter((event) => event.status === "Em Andamento"), // Corrigido para "Em Andamento"
          completed: data.filter((event) => event.status === "Concluído"),
        };

        setEventsState(grouped);
      } catch (error) {
        console.error("Erro ao buscar eventos do backend:", error);
        setError("Erro ao carregar eventos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const formatDateForSearch = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
  };

  const allEvents = [
    ...eventsState.pending,
    ...eventsState.inProgress,
    ...eventsState.completed,
  ];
  
  const filteredEvents = allEvents.filter((event) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();

    const searchableFields = [
      String(event.title || ""),
      String(event.description || ""),
      String(event.responsible || ""),
      String(event.eventType || ""),
      String(event.eventFormat || ""),
      String(event.organizer || ""),
      String(event.location || ""),
      String(event.costCenter || ""),
      String(event.requester || ""),
      formatDateForSearch(event.startDate),
      formatDateForSearch(event.endDate),
    ];

    return searchableFields.some((field) =>
      field.toLowerCase().includes(searchLower)
    );
  });

  const columns = {
    Aguardando: filteredEvents.filter((event) =>
      eventsState.pending.some((e) => e.id === event.id)
    ),
    "Em Andamento": filteredEvents.filter((event) => // Corrigido para "Em Andamento"
      eventsState.inProgress.some((e) => e.id === event.id)
    ),
    Concluído: filteredEvents.filter((event) =>
      eventsState.completed.some((e) => e.id === event.id)
    ),
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const findContainer = (id) => {
    if (id === "Aguardando" || id === "Em Andamento" || id === "Concluído") { // Corrigido para "Em Andamento"
      return id;
    }

    if (eventsState.pending.find(item => item.id === id)) {
      return "Aguardando";
    }
    if (eventsState.inProgress.find(item => item.id === id)) {
      return "Em Andamento"; // Corrigido para "Em Andamento"
    }
    if (eventsState.completed.find(item => item.id === id)) {
      return "Concluído";
    }

    return null;
  };

  const getStateKey = (columnName) => {
    switch (columnName) {
      case "Aguardando": return "pending";
      case "Em Andamento": return "inProgress"; // Corrigido para "Em Andamento"
      case "Concluído": return "completed";
      default: return null;
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
  const { active, over } = event;
  setActiveId(null);

  if (!over) return;

  const activeContainer = findContainer(active.id);
  const overContainer = findContainer(over.id);

  if (!activeContainer || !overContainer) return;

  const activeStateKey = getStateKey(activeContainer);
  const overStateKey = getStateKey(overContainer);

  if (!activeStateKey || !overStateKey) return;

  const isSameColumn = activeContainer === overContainer;

  setEventsState((prev) => {
    const activeItems = [...prev[activeStateKey]];
    const overItems = isSameColumn ? activeItems : [...prev[overStateKey]];
    const activeIndex = activeItems.findIndex((item) => item.id === active.id);

    if (activeIndex === -1) return prev;

    const [movedItem] = activeItems.splice(activeIndex, 1);

    if (!isSameColumn) {
      // Mover para nova coluna - sempre adicionar no final
      overItems.push(movedItem);
    } else {
      // Reordenar na mesma coluna
      const overIndex = overItems.findIndex((item) => item.id === over.id);
      if (overIndex !== -1) {
        overItems.splice(overIndex, 0, movedItem);
      } else {
        overItems.push(movedItem);
      }
    }

    return {
      ...prev,
      [activeStateKey]: activeItems,
      [overStateKey]: overItems,
    };
  });

  // Atualizar status no backend apenas se mudou de coluna
  if (!isSameColumn) {
    try {
      await updateEventStatus(active.id, overContainer);
      console.log(`✅ Evento ${active.id} atualizado para: ${overContainer}`);
    } catch (error) {
      console.error("Erro ao atualizar status do evento:", error);
      // Reverter em caso de erro
      setEventsState((prev) => {
        const revertActiveItems = [...prev[overStateKey]];
        const revertOverItems = [...prev[activeStateKey]];
        const revertIndex = revertActiveItems.findIndex((item) => item.id === active.id);
        
        if (revertIndex !== -1) {
          const [revertItem] = revertActiveItems.splice(revertIndex, 1);
          revertOverItems.push(revertItem);
        }
        
        return {
          ...prev,
          [activeStateKey]: revertOverItems,
          [overStateKey]: revertActiveItems,
        };
      });
    }
  }
};


  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  // ✅ NOVO: Função para lidar com a exclusão de um evento
  const handleDeleteEvent = (deletedEventId) => {
    setEventsState((prevEventsState) => {
      const newState = { ...prevEventsState };
      for (const key in newState) {
        newState[key] = newState[key].filter((event) => event.id !== deletedEventId);
      }
      return newState;
    });
  };

  const activeItem = activeId ? allEvents.find(item => item.id === activeId) : null;

  if (loading) {
    return (
      <UserProvider>
        <div className="kanban-container">
          <div className="kanban-header">
            <button className="kanban-back-button" onClick={() => navigate("/")}>
              ←
            </button>
            <h1>Quadro Kanban</h1>
          </div>
          <UserHeader />
          <div className="loading-message">Carregando eventos...</div>
        </div>
      </UserProvider>
    );
  }

  if (error) {
    return (
      <UserProvider>
        <div className="kanban-container">
          <div className="kanban-header">
            <button className="kanban-back-button" onClick={() => navigate("/")}>
              ←
            </button>
            <h1>Quadro Kanban</h1>
          </div>
          <UserHeader />
          <div className="error-message">
            {error}
            <button onClick={() => window.location.reload()}>Tentar novamente</button>
          </div>
        </div>
      </UserProvider>
    );
  }

  return (
    <UserProvider> {/* Envolve o componente principal com UserProvider */}
      <div className="kanban-container">
        <div className="kanban-header">
          <button className="kanban-back-button" onClick={() => navigate("/")}>
            ←
          </button>
          <h1>Quadro Kanban</h1>
        </div>

        <UserHeader /> {/* Adiciona o componente UserHeader */}

        <SearchFilter onSearch={handleSearch} placeholder="Pesquisar eventos..." />

        <div className="kanban-page-header">
          <h2 className="kanban-page-title">Eventos</h2>
          <button className="kanban-add-button" onClick={() => navigate("/form")}>
            + Novo
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-board">
            {Object.entries(columns).map(([columnId, events]) => (
              <DroppableColumn key={columnId} id={columnId}>
                <div className="kanban-column" data-column={columnId}>
                  <div className="kanban-column-header">
                    <h3>{columnId}</h3>
                    <span className="kanban-column-count">{events.length}</span>
                  </div>
                  <SortableContext
                    items={events.map((e) => e.id)}
                    id={columnId}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="kanban-cards">
                      {events.length > 0 ? (
                        events.map((event) => (
                          <KanbanCard
                            key={event.id}
                            event={event}
                            column={columnId}
                            onDelete={handleDeleteEvent} // Passa a função de exclusão
                          />
                        ))
                      ) : (
                        <div className="empty-column-drop-zone">
                          <p className="no-kanban-results">
                            Nenhum evento encontrado nesta coluna.
                          </p>
                          <p className="drop-hint">
                            Arraste um card aqui para movê-lo para esta coluna
                          </p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              </DroppableColumn>
            ))}
          </div>
          
          <DragOverlay>
            {activeItem ? (
              <KanbanCard event={activeItem} column="dragging" />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </UserProvider>
  );
}
