import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Tenta carregar o usuário do localStorage
    const storedUser = localStorage.getItem("eventCurrentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        console.log("✅ Usuário carregado do localStorage:", user.name);
      } catch (error) {
        console.error("Erro ao parsear usuário do localStorage:", error);
        createDefaultUser();
      }
    } else {
      // Se não houver usuário no localStorage, cria um padrão
      createDefaultUser();
    }
  }, []);

  const createDefaultUser = () => {
    const defaultUser = {
      id: `user-${Date.now()}`,
      name: "Usuário Padrão",
      email: "padrao@example.com",
      initials: "UP",
      role: "user",
    };
    setCurrentUser(defaultUser);
    localStorage.setItem("eventCurrentUser", JSON.stringify(defaultUser));
    console.log("🔄 Usuário padrão criado:", defaultUser.name);
  };

  const updateUser = (newUserData) => {
    const updatedUser = {
      ...currentUser,
      ...newUserData,
      initials: newUserData.name ? newUserData.name.charAt(0).toUpperCase() : (currentUser?.initials || "U"),
    };
    setCurrentUser(updatedUser);
    localStorage.setItem("eventCurrentUser", JSON.stringify(updatedUser));
    console.log("✅ Perfil do usuário atualizado:", updatedUser.name);
  };

  const value = { currentUser, updateUser };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
