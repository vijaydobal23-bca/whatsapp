import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";
import { loginApi, registerApi } from "../api/auth.api.js";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { user, setUser, loading, setLoading, error, setError, clearError } =
    useContext(AuthContext);
  const navigate = useNavigate();

  // login
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      clearError();
      const res = await loginApi(email, password);
      setUser(res.user);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // register
  const handleRegister = async (username, email, password) => {
    try {
      setLoading(true);
      clearError();
      const res = await registerApi(username, email, password);
      setUser(res.user);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    clearError,
    handleLogin,
    handleRegister,
  };
};