import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../ApiClient/interceptor";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const getUser = async () => {
    try {
      const response = await apiClient.get("auth/get-user");
      setUser(response.data.data);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  const login = async (formData) => {
    try {
      const response = await apiClient.post("auth/signin", formData);
      setUser(response.data.data);
      return response.data.data;
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  };
  const value = {
    user,
    setUser,
    login,
    getUser,
    loading,
    isAuthenticated: !!user,
  };
  return (
    <>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
