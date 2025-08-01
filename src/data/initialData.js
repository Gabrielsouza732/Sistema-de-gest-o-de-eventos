const initialData = {
  events: {
    pending: [
      {
        id: 1,
        title: "Conferência de Marketing",
        description: "Evento anual de marketing digital com palestrantes renomados da área. Serão abordados temas como SEO, redes sociais, e-commerce e tendências do mercado digital.",
        startDate: "2025-07-15",
        endDate: "2025-07-17",
        location: "Centro de Convenções São Paulo",
        eventType: "Palestra",
        eventFormat: "Presencial",
        costCenter: "MKT-001",
        organizer: "Maria Silva",
        requester: "João Santos",
        estimatedAttendees: 200,
        estimatedBudget: 15000,
        priority: "Alta",
        notes: "Evento importante para networking"
      },
      {
        id: 2,
        title: "Treinamento React Avançado",
        description: "Workshop intensivo sobre React.js com foco em hooks, context API e performance optimization.",
        startDate: "2025-07-20",
        endDate: "2025-07-22",
        location: "Sala de Treinamento A",
        eventType: "Treinamento",
        eventFormat: "Presencial",
        costCenter: "TI-002",
        organizer: "Pedro Costa",
        requester: "Ana Oliveira",
        estimatedAttendees: 25,
        estimatedBudget: 5000,
        priority: "Média",
        notes: "Material didático incluído"
      }
    ],
    inProgress: [
      {
        id: 3,
        title: "Reunião de Planejamento Q3",
        description: "Reunião estratégica para definir metas e objetivos do terceiro trimestre.",
        startDate: "2025-07-10",
        endDate: "2025-07-10",
        location: "Sala de Reuniões Principal",
        eventType: "Reunião",
        eventFormat: "Presencial",
        costCenter: "ADM-003",
        organizer: "Carlos Mendes",
        requester: "Diretoria",
        estimatedAttendees: 15,
        estimatedBudget: 500,
        priority: "Alta",
        notes: "Presença obrigatória dos gerentes"
      }
    ],
    completed: [
      {
        id: 4,
        title: "Workshop de UX/UI Design",
        description: "Workshop sobre princípios de design de interface e experiência do usuário.",
        startDate: "2025-07-01",
        endDate: "2025-07-03",
        location: "Laboratório de Design",
        eventType: "Treinamento",
        eventFormat: "Presencial",
        costCenter: "DES-004",
        organizer: "Fernanda Lima",
        requester: "Equipe de Design",
        estimatedAttendees: 20,
        estimatedBudget: 3000,
        priority: "Média",
        notes: "Evento concluído com sucesso"
      }
    ]
  }
};

export default initialData;