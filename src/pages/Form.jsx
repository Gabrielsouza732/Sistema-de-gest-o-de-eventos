import React, { useState } from "react";
import "./Form.css";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../services/api";


export default function Form() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    eventType: "",
    eventFormat: "",
    costCenter: "",
    organizer: "",
    requester: "",
    estimatedAttendees: "",
    budget: "",
    notes: ""
  });

  const eventTypes = ["Treinamento", "Missão Técnica", "Palestra", "Reunião", "Evento setorial"];
  const eventFormats = ["Online", "Presencial"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.title || !formData.description || !formData.startDate) {
    alert("Por favor, preencha os campos obrigatórios.");
    return;
  }

  try {
    await createEvent({
  ...formData,
  estimatedAttendees: Number(formData.estimatedAttendees),
  estimatedBudget: Number(formData.budget),
  startDate: new Date(formData.startDate),
  endDate: formData.endDate ? new Date(formData.endDate) : null,
  status: "Aguardando",
  responsible: formData.requester,
    });


    alert("✅ Evento cadastrado com sucesso!");
    navigate("/kanban");
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    alert("❌ Erro ao cadastrar evento. Tente novamente.");
  }
};


  return (
    <div className="form-container">
      <h2>Cadastro de Evento</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-layout">
          <fieldset>
            <legend>Informações Básicas</legend>

            <label>Título do Evento *</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Título" />

            <label>Descrição *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descrição" />

            <div className="row">
              <div>
                <label>Data Inicial *</label>
                <input name="startDate" value={formData.startDate} onChange={handleChange} type="date" />
              </div>
              <div>
                <label>Data Final</label>
                <input name="endDate" value={formData.endDate} onChange={handleChange} type="date" />
              </div>
            </div>

            <label>Local</label>
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Local" />

            <div className="row">
              <div>
                <label>Tipo de Evento</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange}>
                  <option value="">Selecione</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Formato do Evento</label>
                <select name="eventFormat" value={formData.eventFormat} onChange={handleChange}>
                  <option value="">Selecione</option>
                  {eventFormats.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>
            </div>

            <label>Centro de Custo</label>
            <input name="costCenter" value={formData.costCenter} onChange={handleChange} />
          </fieldset>

          <fieldset>
            <legend>Responsáveis</legend>
            <label>Solicitante</label>
            <input name="requester" value={formData.requester} onChange={handleChange} />

            <label>Organizador</label>
            <input name="organizer" value={formData.organizer} onChange={handleChange} />
          </fieldset>

          <fieldset>
            <legend>Detalhes Adicionais</legend>
            <label>Nº Estimado de Participantes</label>
            <input name="estimatedAttendees" value={formData.estimatedAttendees} onChange={handleChange} type="number" />

            <label>Orçamento Estimado (R$)</label>
            <input name="budget" value={formData.budget} onChange={handleChange} type="number" />

            <label>Observações</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} />
          </fieldset>

          <div className="buttons">
            <button type="button" className="cancel" onClick={() => navigate("/")}>Cancelar</button>
            <button type="submit" className="submit">Cadastrar Evento</button>
          </div>
          <p className="note">* Campos obrigatórios</p>
        </div>
      </form>
    </div>
  );
}
