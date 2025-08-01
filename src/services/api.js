import axios from "axios";

// Base da URL do back-end
const API_BASE_URL = "http://localhost:3001/api";

// ========== EVENTOS ==========

// Buscar todos os eventos (com filtros opcionais )

export const fetchEvents = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });
    
    const url = queryParams.toString() 
      ? `${API_BASE_URL}/events?${queryParams.toString()}`
      : `${API_BASE_URL}/events`;
      
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw error;
  }
};

// Buscar evento por ID
export const fetchEventById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    throw error;
  }
};

// Criar novo evento
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/events`, eventData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
};

// Atualizar evento
export const updateEvent = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/events/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    throw error;
  }
};

// Atualizar apenas o status do evento
export const updateEventStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/events/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar status do evento:", error);
    throw error;
  }
};

// Deletar evento
export const deleteEvent = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar evento:", error);
    throw error;
  }
};

// ========== CHECKLIST ==========

// Buscar itens do checklist por evento
export const fetchChecklistItems = async (eventId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/checklist/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar itens do checklist:", error);
    throw error;
  }
};

// Criar item do checklist
export const createChecklistItem = async (checklistData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checklist`, checklistData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar item do checklist:", error);
    throw error;
  }
};

// Atualizar item do checklist
export const updateChecklistItem = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/checklist/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar item do checklist:", error);
    throw error;
  }
};

// Deletar item do checklist
export const deleteChecklistItem = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/checklist/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar item do checklist:", error);
    throw error;
  }
};

// ========== COMENTÁRIOS ==========

// Buscar comentários por evento
export const fetchComments = async (eventId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/comments/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    throw error;
  }
};

// Criar comentário
export const createComment = async (commentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    throw error;
  }
};

// Atualizar comentário
export const updateComment = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/comments/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar comentário:", error);
    throw error;
  }
};

// Deletar comentário
export const deleteComment = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/comments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    throw error;
  }
};
