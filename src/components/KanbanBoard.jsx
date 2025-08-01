import React, { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import EventModal from "./EventModal";
import initialData from "../data/initialData";

export default function KanbanBoard() {
  const [events, setEvents] = useState(initialData.events);
  const [comments, setComments] = useState(initialData.comments);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const columns = [
    { key: "pending", title: "Pendentes" },
    { key: "inProgress", title: "Em Andamento" },
    { key: "completed", title: "Concluídos" },
  ];

  const openEventModal = (event, column) => {
    setSelectedEvent({ ...event, column });
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-xl font-bold text-gray-800">Quadro Kanban</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
          Novo Evento
        </button>
      </header>

      <main className="flex flex-1 overflow-x-auto p-4 space-x-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.key}
            title={col.title}
            events={events[col.key]}
            onEventClick={(event) => openEventModal(event, col.key)}
          />
        ))}
      </main>

      {modalOpen && (
        <EventModal
          event={selectedEvent}
          onClose={() => setModalOpen(false)}
          comments={comments[selectedEvent.id] || []}
        />
      )}
    </div>
  );
}
