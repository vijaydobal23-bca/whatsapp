import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0b141a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#00a884] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[#8696a0] text-sm">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default Protected;