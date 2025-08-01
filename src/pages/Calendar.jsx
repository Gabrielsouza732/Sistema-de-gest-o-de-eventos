import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Calendar.css';
import SearchFilter from '../components/SearchFilter';
import initialData from '../data/initialData';

export default function Calendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [searchText, setSearchText] = useState('');

  // Dados de eventos usando initialData com mapeamento correto
  const allEvents = [
    ...initialData.events.pending.map(event => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      budget: event.estimatedBudget,
      status: 'Aguardando',
      color: event.priority === 'Alta' ? '#FF5733' : 
             event.priority === 'Média' ? '#33A1FF' : '#33FF57'
    })),
    ...initialData.events.inProgress.map(event => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      budget: event.estimatedBudget,
      status: 'Em execução',
      color: event.priority === 'Alta' ? '#FF5733' : 
             event.priority === 'Média' ? '#33A1FF' : '#33FF57'
    })),
    ...initialData.events.completed.map(event => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      budget: event.estimatedBudget,
      status: 'Concluído',
      color: event.priority === 'Alta' ? '#FF5733' : 
             event.priority === 'Média' ? '#33A1FF' : '#33FF57'
    }))
  ];

  // Lógica de filtro para os eventos
  const filteredEvents = allEvents.filter((event) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.eventType.toLowerCase().includes(searchLower) ||
      event.eventFormat.toLowerCase().includes(searchLower) ||
      event.organizer.toLowerCase().includes(searchLower) ||
      event.requester.toLowerCase().includes(searchLower) ||
      event.notes.toLowerCase().includes(searchLower)
    );
  });

  const handleSearch = (text) => {
    setSearchText(text);
  };

  // Função para gerar os dias do mês atual
  const generateDaysInMonth = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    
    const days = [];
    
    // Adicionar dias vazios para alinhar com o dia da semana correto
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', isCurrentMonth: false });
    }
    
    // Adicionar os dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(selectedYear, selectedMonth, i);
      const isToday = 
        date.getDate() === new Date().getDate() && 
        date.getMonth() === new Date().getMonth() && 
        date.getFullYear() === new Date().getFullYear();
      
      const dayEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return (
          eventDate.getDate() === i && 
          eventDate.getMonth() === selectedMonth && 
          eventDate.getFullYear() === selectedYear
        );
      });
      
      days.push({ 
        day: i, 
        isCurrentMonth: true, 
        isToday, 
        events: dayEvents 
      });
    }
    
    return days;
  };

  // Função para navegar entre meses
  const navigateMonth = (direction) => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    
    if (direction === 'next') {
      newMonth += 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
    } else {
      newMonth -= 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // Função para formatar a data
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Função para mostrar detalhes do evento
  const showEventDetailsModal = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Nomes dos meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Nomes dos dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Renderizar dias da semana
  const renderWeekDays = () => {
    return (
      <div className="week-days-container">
        {weekDays.map((day, index) => (
          <div key={index} className="week-day">
            <span className="week-day-text">{day}</span>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar calendário mensal
  const renderMonthView = () => {
    const days = generateDaysInMonth();
    
    return (
      <div className="calendar-container">
        {renderWeekDays()}
        <div className="days-container">
          {days.map((item, index) => (
            <div 
              key={index} 
              className={`day-cell ${item.isToday ? 'today-cell' : ''} ${!item.isCurrentMonth ? 'other-month-cell' : ''}`}
              onClick={() => item.day && setSelectedDate(new Date(selectedYear, selectedMonth, item.day))}
            >
              <span className={`day-text ${item.isToday ? 'today-text' : ''}`}>
                {item.day}
              </span>
              
              {item.events && item.events.length > 0 && (
                <div className="events-container">
                  {item.events.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="event-indicator"
                      style={{ backgroundColor: event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showEventDetailsModal(event);
                      }}
                    >
                      <span className="event-title">
                        {event.title}
                      </span>
                    </div>
                  ))}
                  {item.events.length > 3 && (
                    <span className="more-events-text">+{item.events.length - 3} mais</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar visualização semanal
  const renderWeekView = () => {
    // Encontrar o primeiro dia da semana (domingo) para a data selecionada
    const firstDayOfWeek = new Date(selectedDate);
    const day = selectedDate.getDay();
    firstDayOfWeek.setDate(selectedDate.getDate() - day);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(firstDayOfWeek);
      currentDate.setDate(firstDayOfWeek.getDate() + i);
      
      const isToday = 
        currentDate.getDate() === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() && 
        currentDate.getFullYear() === new Date().getFullYear();
      
      const dayEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return (
          eventDate.getDate() === currentDate.getDate() && 
          eventDate.getMonth() === currentDate.getMonth() && 
          eventDate.getFullYear() === currentDate.getFullYear()
        );
      });
      
      weekDays.push({
        date: currentDate,
        isToday,
        events: dayEvents
      });
    }
    
    return (
      <div className="week-view-container">
        <div className="week-header-container">
          {weekDays.map((day, index) => (
            <div key={index} className={`week-view-day ${day.isToday ? 'today-header' : ''}`}>
              <span className="week-day-name">{day.date.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
              <span className={`week-day-number ${day.isToday ? 'today-text' : ''}`}>
                {day.date.getDate()}
              </span>
            </div>
          ))}
        </div>
        
        <div className="week-events-container">
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="week-day-events">
              {day.events.length > 0 ? (
                day.events.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="week-event-item"
                    style={{ borderLeftColor: event.color }}
                    onClick={() => showEventDetailsModal(event)}
                  >
                    <span className="week-event-time">
                      {event.startDate.getHours().toString().padStart(2, '0')}:
                      {event.startDate.getMinutes().toString().padStart(2, '0')}
                    </span>
                    <span className="week-event-title">{event.title}</span>
                  </div>
                ))
              ) : (
                <span className="no-events-text">Sem eventos</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar visualização diária
  const renderDayView = () => {
    const dayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === selectedDate.getDate() && 
        eventDate.getMonth() === selectedDate.getMonth() && 
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    
    // Horários para a visualização diária (de 8h às 18h)
    const hours = [];
    for (let i = 8; i <= 18; i++) {
      hours.push(i);
    }
    
    return (
      <div className="day-view-container">
        <div className="day-view-header">
          <span className="day-view-date">
            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        
        <div className="day-view-schedule">
          {hours.map((hour, index) => {
            const hourEvents = dayEvents.filter(event => 
              new Date(event.startDate).getHours() === hour
            );
            
            return (
              <div key={index} className="hour-row">
                <span className="hour-text">{hour}:00</span>
                <div className="hour-events">
                  {hourEvents.length > 0 ? (
                    hourEvents.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="day-event-item"
                        style={{ 
                          backgroundColor: `${event.color}20`, 
                          borderLeftColor: event.color 
                        }}
                        onClick={() => showEventDetailsModal(event)}
                      >
                        <span className="day-event-title">{event.title}</span>
                        <span className="day-event-details">
                          {event.location} • {event.eventType}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-hour" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-page-container">
      {/* Header azul com botão voltar */}
      <div className="calendar-header">
        <button className="calendar-back-button" onClick={() => navigate("/")}>←</button>
        <h1>Calendário de Eventos</h1>
      </div>

      {/* Adiciona o componente de pesquisa */}
      <SearchFilter onSearch={handleSearch} placeholder="Pesquisar eventos..." />

      {/* Cabeçalho do Calendário */}
      <div className="calendar-controls">
        <div className="month-selector">
          <button onClick={() => navigateMonth('prev')} className="nav-button">
            ‹
          </button>
          
          <span className="month-year-text">
            {monthNames[selectedMonth]} {selectedYear}
          </span>
          
          <button onClick={() => navigateMonth('next')} className="nav-button">
            ›
          </button>
        </div>
        
        <div className="view-selector">
          <button 
            className={`view-button ${viewMode === 'month' ? 'active-view-button' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Mês
          </button>
          
          <button 
            className={`view-button ${viewMode === 'week' ? 'active-view-button' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Semana
          </button>
          
          <button 
            className={`view-button ${viewMode === 'day' ? 'active-view-button' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Dia
          </button>
        </div>
      </div>
      
      {/* Conteúdo do Calendário */}
      <div className="calendar-content">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
      
      {/* Legenda de Eventos */}
      <div className="legend-container">
        <span className="legend-title">Legenda:</span>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF5733' }} />
            <span className="legend-text">Alta Prioridade</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#33A1FF' }} />
            <span className="legend-text">Média Prioridade</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#33FF57' }} />
            <span className="legend-text">Baixa Prioridade</span>
          </div>
        </div>
      </div>
      
      {/* Modal de Detalhes do Evento */}
      {showEventDetails && (
        <div className="modal-overlay" onClick={() => setShowEventDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedEvent && (
              <>
                <div className="event-header" style={{ backgroundColor: selectedEvent.color }}>
                  <span className="event-header-title">{selectedEvent.title}</span>
                  <button 
                    className="close-button"
                    onClick={() => setShowEventDetails(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="event-details">
                  <div className="event-detail-item">
                    <span className="event-detail-icon">📅</span>
                    <span className="event-detail-text">
                      {formatDate(selectedEvent.startDate)}
                      {selectedEvent.startDate.toDateString() !== selectedEvent.endDate.toDateString() && 
                        ` - ${formatDate(selectedEvent.endDate)}`}
                    </span>
                  </div>
                  
                  <div className="event-detail-item">
                    <span className="event-detail-icon">📍</span>
                    <span className="event-detail-text">{selectedEvent.location}</span>
                  </div>
                  
                  <div className="event-detail-item">
                    <span className="event-detail-icon">🏷️</span>
                    <span className="event-detail-text">
                      {selectedEvent.eventType} • {selectedEvent.eventFormat}
                    </span>
                  </div>
                  
                  <div className="event-detail-item">
                    <span className="event-detail-icon">🏢</span>
                    <span className="event-detail-text">
                      Centro de Custo: {selectedEvent.costCenter}
                    </span>
                  </div>
                  
                  <div className="event-detail-item">
                    <span className="event-detail-icon">👤</span>
                    <span className="event-detail-text">
                      Organizador: {selectedEvent.organizer}
                    </span>
                  </div>
                  
                  <div className="event-detail-item">
                    <span className="event-detail-icon">👥</span>
                    <span className="event-detail-text">
                      Solicitante: {selectedEvent.requester}
                    </span>
                  </div>
                  
                  <div className="event-detail-item">
                    <span className="event-detail-icon">👨‍👩‍👧‍👦</span>
                    <span className="event-detail-text">
                      Participantes Estimados: {selectedEvent.estimatedAttendees}
                    </span>
                  </div>
                  
                  <div className="event-detail-item">
                    <span className="event-detail-icon">💰</span>
                    <span className="event-detail-text">
                      Orçamento: R$ {selectedEvent.budget}
                    </span>
                  </div>
                  
                  <div className="event-detail-item">
                    <span className="event-detail-icon">⚠️</span>
                    <span className="event-detail-text">
                      Status: {selectedEvent.status} • Prioridade: {selectedEvent.priority}
                    </span>
                  </div>
                  
                  {selectedEvent.notes && (
                    <div className="notes-container">
                      <span className="notes-title">Observações:</span>
                      <span className="notes-text">{selectedEvent.notes}</span>
                    </div>
                  )}
                </div>
                
                <div className="event-actions">
                  <button className="action-button">
                    <span className="action-icon">✏️</span>
                    <span className="action-button-text">Editar</span>
                  </button>
                  
                  <button className="action-button delete-button">
                    <span className="action-icon">🗑️</span>
                    <span className="action-button-text">Excluir</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
