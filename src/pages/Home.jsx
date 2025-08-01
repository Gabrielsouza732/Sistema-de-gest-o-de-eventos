import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  // 🧠 Estados para login leve
  const [userName, setUserName] = useState(localStorage.getItem('eventUserName') || '');
  const [showLoginModal, setShowLoginModal] = useState(!localStorage.getItem('eventUserName'));

  const handleLogin = (name) => {
    localStorage.setItem('eventUserName', name);
    setUserName(name);
    setShowLoginModal(false);
  };

  // 🛑 Bloqueia acesso até o usuário se identificar
  if (showLoginModal) {
    return (
      <div className="login-modal-backdrop">
        <div className="login-modal">
          <h2>Bem-vindo!</h2>
          <p>Identifique-se para continuar:</p>
          <input
            type="text"
            list="team-members"
            placeholder="Digite seu nome ou escolha"
            id="loginNameInput"
            />
          <datalist id="team-members">
          <option value="Bianca" />
          <option value="Jani" />
          <option value="Daniel" />
          <option value="Amanda" />
          <option value="Isabella" />
          <option value="Simone" />
          <option value="Wilson" />
          <option value="Gabriel Dias" />
          <option value="Gislene" />
            </datalist>
          <div className="login-actions">
            <button onClick={() => {
              const name = document.getElementById('loginNameInput').value.trim();
              if (name) handleLogin(name);
            }}>
              Entrar
            </button>
            <button onClick={() => handleLogin('Visitante')}>
              Entrar como visitante
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conteúdo principal da Home
  const cards = [
    { 
      icon: "✏️", 
      title: "Novo Evento", 
      description: "Cadastre uma nova demanda de evento através do formulário", 
      to: "/form",
      keywords: ["novo", "evento", "cadastrar", "formulário", "demanda", "criar"]
    },
    { 
      icon: "📋", 
      title: "Quadro Kanban", 
      description: "Visualize e gerencie suas demandas em formato Kanban", 
      to: "/kanban",
      keywords: ["kanban", "quadro", "visualizar", "gerenciar", "demandas", "organizar"]
    },
    { 
      icon: "👥", 
      title: "Gerenciar Membros", 
      description: "Adicione e gerencie membros da sua equipe", 
      to: "/members",
      keywords: ["membros", "equipe", "gerenciar", "adicionar", "usuários", "pessoas"]
    },
    { 
      icon: "📅", 
      title: "Calendário", 
      description: "Visualize seus eventos em formato de calendário", 
      to: "/calendar",
      keywords: ["calendário", "eventos", "datas", "agenda", "cronograma", "horários"]
    },
    { 
      icon: "📊", 
      title: "Relatórios", 
      description: "Visualize e exporte relatórios em formato XLSX", 
      to: "/reports",
      keywords: ["relatórios", "exportar", "xlsx", "dados", "análise", "estatísticas"]
    },
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="header-title">Plataforma de Gestão de Eventos</h1>
        <p className="header-subtitle">Organize suas demandas de forma eficiente</p>
      </div>

      <div className="home-content">
        <div className="cards-container">
          {cards.map((card) => (
            <div key={card.title} className="card" onClick={() => navigate(card.to)}>
              <div className="card-icon">
                <span className="icon-emoji">{card.icon}</span>
              </div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
            </div>
          ))}
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-number">0</span>
            <span className="stat-label">Eventos Pendentes</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">0</span>
            <span className="stat-label">Em Andamento</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">0</span>
            <span className="stat-label">Concluídos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
