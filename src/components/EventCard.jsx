import React from "react";

export default function EventCard({ event, onClick }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Alta": return "bg-red-500";
      case "Média": return "bg-yellow-500";
      case "Baixa": return "bg-blue-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded shadow p-4 cursor-pointer hover:shadow-md transition"
    >
      <div className={`absolute top-0 left-0 h-full w-1.5 ${getPriorityColor(event.priority)} rounded-l`} />

      <h3 className="text-md font-semibold text-gray-800 mb-1 pl-2">{event.title}</h3>
      <p className="text-sm text-gray-600 mb-1 pl-2">
        {event.startDate} {event.startDate !== event.endDate ? `- ${event.endDate}` : ""}
      </p>
      <p className="text-xs text-gray-500 pl-2">Resp: {event.organizer}</p>
    </div>
  );
}
