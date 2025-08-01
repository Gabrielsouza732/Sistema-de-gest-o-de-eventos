import React from "react";

export default function EventModal({ event, onClose, comments }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">{event.title}</h2>

        <div className="space-y-2 mb-6">
          <p><span className="font-semibold">Data:</span> {event.startDate} {event.startDate !== event.endDate ? `- ${event.endDate}` : ""}</p>
          <p><span className="font-semibold">Responsável:</span> {event.organizer}</p>
          <p><span className="font-semibold">Prioridade:</span> {event.priority}</p>
          <p><span className="font-semibold">Descrição:</span> {event.description}</p>
          <p><span className="font-semibold">Local:</span> {event.location}</p>
          <p><span className="font-semibold">Tipo:</span> {event.eventType}</p>
          <p><span className="font-semibold">Formato:</span> {event.eventFormat}</p>
          <p><span className="font-semibold">Centro de Custo:</span> {event.costCenter}</p>
          <p><span className="font-semibold">Solicitante:</span> {event.requester}</p>
          <p><span className="font-semibold">Participantes:</span> {event.estimatedParticipants}</p>
          <p><span className="font-semibold">Orçamento:</span> R$ {event.estimatedBudget}</p>
          <p><span className="font-semibold">Observações:</span> {event.observations}</p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Comentários</h3>
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="border-b pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{c.author}</span>
                    <span className="text-xs text-gray-500">{c.timestamp}</span>
                  </div>
                  <p className="text-gray-700">{c.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="italic text-gray-500">Nenhum comentário ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}