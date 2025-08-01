import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Form from "./pages/Form"; /* Caminho corrigido */
import Kanban from "./pages/Kanban";
import Members from "./pages/Members";
import Reports from "./pages/Reports";
import Calendar from "./pages/Calendar"; // Importa o componente Calendar
import Home from "./pages/Home"; // Importa o componente Home
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Define Home como a rota principal */}
        <Route path="/form" element={<Form />} />
        <Route path="/kanban" element={<Kanban />} />
        <Route path="/members" element={<Members />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </Router>
  );
}
