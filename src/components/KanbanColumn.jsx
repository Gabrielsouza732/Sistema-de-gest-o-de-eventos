import React from "react";
import EventCard from "./EventCard";

export default function KanbanColumn({ title, events, onEventClick }) {
  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-gray-200 rounded-lg shadow p-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <span className="bg-blue-600 text-white rounded-full text-sm px-2">
          {events.length}
        </span>
      </div>

      <div className="flex flex-col space-y-4 overflow-y-auto">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
      </div>
    </div>
  );
}
