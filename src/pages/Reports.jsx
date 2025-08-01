import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import '../styles/Reports.css';
import initialData from '../data/initialData';

export default function Reports() {
  const navigate = useNavigate();
  
  // Estado para todos os eventos (combinados de todas as colunas)
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // Estados dos filtros
  const [filters, setFilters] = useState({
    requester: '',
    costCenter: '',
    eventType: '',
    eventFormat: '',
    organizer: '',
    location: '',
    startDate: '',
    endDate: ''
  });

  // Opções únicas para os filtros
  const [filterOptions, setFilterOptions] = useState({
    requesters: [],
    costCenters: [],
    eventTypes: [],
    eventFormats: [],
    organizers: [],
    locations: []
  });

  // Inicializar dados
  useEffect(() => {
    const events = [
      ...initialData.events.pending,
      ...initialData.events.inProgress,
      ...initialData.events.completed
    ];
    
    setAllEvents(events);
    setFilteredEvents(events);
    
    // Extrair opções únicas para os filtros
    const requesters = [...new Set(events.map(e => e.requester))];
    const costCenters = [...new Set(events.map(e => e.costCenter))];
    const eventTypes = [...new Set(events.map(e => e.eventType))];
    const eventFormats = [...new Set(events.map(e => e.eventFormat))];
    const organizers = [...new Set(events.map(e => e.organizer))];
    const locations = [...new Set(events.map(e => e.location))];
    
    setFilterOptions({
      requesters,
      costCenters,
      eventTypes,
      eventFormats,
      organizers,
      locations
    });
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = allEvents;

    if (filters.requester) {
      filtered = filtered.filter(event => event.requester === filters.requester);
    }
    if (filters.costCenter) {
      filtered = filtered.filter(event => event.costCenter === filters.costCenter);
    }
    if (filters.eventType) {
      filtered = filtered.filter(event => event.eventType === filters.eventType);
    }
    if (filters.eventFormat) {
      filtered = filtered.filter(event => event.eventFormat === filters.eventFormat);
    }
    if (filters.organizer) {
      filtered = filtered.filter(event => event.organizer === filters.organizer);
    }
    if (filters.location) {
      filtered = filtered.filter(event => event.location === filters.location);
    }
    if (filters.startDate) {
      filtered = filtered.filter(event => new Date(event.startDate) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(event => new Date(event.startDate) <= new Date(filters.endDate));
    }

    setFilteredEvents(filtered);
  }, [filters, allEvents]);

  // Preparar dados para gráficos
  const prepareChartData = () => {
    const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    return sortedEvents.map(event => ({
      name: event.title,
      date: new Date(event.startDate).toLocaleDateString('pt-BR'),
      gastos: event.estimatedBudget,
      participantes: event.estimatedAttendees,
      fullDate: event.startDate
    }));
  };

  // Dados agregados por mês
  const prepareMonthlyData = () => {
    const monthlyData = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.startDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' }),
          gastos: 0,
          participantes: 0,
          eventos: 0
        };
      }
      
      monthlyData[monthKey].gastos += event.estimatedBudget;
      monthlyData[monthKey].participantes += event.estimatedAttendees;
      monthlyData[monthKey].eventos += 1;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      requester: '',
      costCenter: '',
      eventType: '',
      eventFormat: '',
      organizer: '',
      location: '',
      startDate: '',
      endDate: ''
    });
  };

  // Função para exportar para Excel
  const exportToExcel = () => {
    const csvContent = [
      ['Título', 'Data', 'Solicitante', 'Centro de Custo', 'Tipo', 'Formato', 'Organizador', 'Local', 'Participantes', 'Orçamento'],
      ...filteredEvents.map(event => [
        event.title,
        new Date(event.startDate).toLocaleDateString('pt-BR'),
        event.requester,
        event.costCenter,
        event.eventType,
        event.eventFormat,
        event.organizer,
        event.location,
        event.estimatedAttendees,
        `R$ ${event.estimatedBudget.toLocaleString('pt-BR')}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_eventos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = prepareChartData();
  const monthlyData = prepareMonthlyData();

  return (
    <div className="reports-container">
      {/* Header azul com botão voltar */}
      <div className="reports-header">
        <button className="reports-back-button" onClick={() => navigate("/")}>←</button>
        <h1>Relatórios</h1>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-header">
          <h2>Filtros</h2>
          <div className="filter-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              🗑 Limpar Filtros
            </button>
            <button className="export-btn" onClick={exportToExcel}>
              📊 Exportar Excel
            </button>
          </div>
        </div>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Solicitante</label>
            <select 
              value={filters.requester} 
              onChange={(e) => setFilters({...filters, requester: e.target.value})}
            >
              <option value="">Todos</option>
              {filterOptions.requesters.map(requester => (
                <option key={requester} value={requester}>{requester}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Centro de Custo</label>
            <select 
              value={filters.costCenter} 
              onChange={(e) => setFilters({...filters, costCenter: e.target.value})}
            >
              <option value="">Todos</option>
              {filterOptions.costCenters.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tipo de Evento</label>
            <select 
              value={filters.eventType} 
              onChange={(e) => setFilters({...filters, eventType: e.target.value})}
            >
              <option value="">Todos</option>
              {filterOptions.eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Formato do Evento</label>
            <select 
              value={filters.eventFormat} 
              onChange={(e) => setFilters({...filters, eventFormat: e.target.value})}
            >
              <option value="">Todos</option>
              {filterOptions.eventFormats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Organizador</label>
            <select 
              value={filters.organizer} 
              onChange={(e) => setFilters({...filters, organizer: e.target.value})}
            >
              <option value="">Todos</option>
              {filterOptions.organizers.map(organizer => (
                <option key={organizer} value={organizer}>{organizer}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Local</label>
            <select 
              value={filters.location} 
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <option value="">Todos</option>
              {filterOptions.locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Data Início</label>
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>

          <div className="filter-group">
            <label>Data Fim</label>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="summary-section">
        <div className="summary-cards-container">
          <div className="summary-card">
            <h3>Total de Eventos</h3>
            <p className="summary-number">{filteredEvents.length}</p>
          </div>
          <div className="summary-card">
            <h3>Total de Gastos</h3>
            <p className="summary-number">
              R$ {filteredEvents.reduce((sum, event) => sum + event.estimatedBudget, 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="summary-card">
            <h3>Total de Participantes</h3>
            <p className="summary-number">
              {filteredEvents.reduce((sum, event) => sum + event.estimatedAttendees, 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="summary-card">
            <h3>Gasto Médio por Evento</h3>
            <p className="summary-number">
              R$ {filteredEvents.length > 0 
                ? Math.round(filteredEvents.reduce((sum, event) => sum + event.estimatedBudget, 0) / filteredEvents.length).toLocaleString('pt-BR')
                : '0'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Gastos por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gastos']} />
              <Legend />
              <Line type="monotone" dataKey="gastos" stroke="#4a6da7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Participantes por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toLocaleString('pt-BR'), 'Participantes']} />
              <Legend />
              <Bar dataKey="participantes" fill="#4299e1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container full-width">
          <h3>Gastos vs Participantes por Evento</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'gastos' ? `R$ ${value.toLocaleString('pt-BR')}` : value.toLocaleString('pt-BR'),
                  name === 'gastos' ? 'Gastos' : 'Participantes'
                ]}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="gastos" stroke="#4a6da7" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="participantes" stroke="#48bb78" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de dados */}
      <div className="table-section">
        <h3>Dados Detalhados</h3>
        <div className="table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th>Solicitante</th>
                <th>Centro de Custo</th>
                <th>Tipo</th>
                <th>Participantes</th>
                <th>Orçamento</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{new Date(event.startDate).toLocaleDateString('pt-BR')}</td>
                  <td>{event.requester}</td>
                  <td>{event.costCenter}</td>
                  <td>{event.eventType}</td>
                  <td>{event.estimatedAttendees}</td>
                  <td>R$ {event.estimatedBudget.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
