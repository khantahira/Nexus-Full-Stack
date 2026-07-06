import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  register: (userData: any) => Promise<void>;
  login: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Sahi Local URL bina /api ke
const API_URL = "http://localhost:5000/api/auth";


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

    const register = async (userData: any) => {
    // Tasalli karlein ke data sahi object format mein ja raha hai
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role
    };

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload), // Object pass karna zaroori hai
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const login = async (userData: any) => {
    const payload = {
      email: userData.email,
      password: userData.password
    };

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
