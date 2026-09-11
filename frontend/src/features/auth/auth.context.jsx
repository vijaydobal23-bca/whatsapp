import { createContext, useState, useEffect } from "react";
import { getMeApi } from "./api/auth.api.js";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // start true so Protected doesn't redirect before check
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  // On mount, check if user is already logged in via cookies
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMeApi();
        if (res?.user) {
          setUser(res.user);
        }
      } catch (err) {
        // Not logged in, that's fine — user stays null
        console.log("Not authenticated");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        error,
        setError,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
