import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api"; // Certifique-se que esta URL está correta

// ========== EVENTOS ==========

export const fetchEvents = async ( ) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/events`, eventData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
};

export const updateEvent = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/events/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    throw error;
  }
};

export const updateEventStatus = async (id, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/events/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar status do evento:", error);
    throw error;
  }
};

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

export const fetchChecklistItems = async (eventId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/checklist/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar itens do checklist:", error);
    throw error;
  }
};

export const updateChecklistItem = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/checklist/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar item do checklist:", error);
    throw error;
  }
};

export const createChecklistItem = async (itemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checklist`, itemData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar item do checklist:", error);
    throw error;
  }
};

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

export const fetchComments = async (eventId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/comments/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    throw error;
  }
};

export const addComment = async (commentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    throw error;
  }
};

// ========== USUÁRIOS ==========

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw error;
  }
};

export const fetchUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar usuário ${userId}:`, error);
    throw error;
  }
};
