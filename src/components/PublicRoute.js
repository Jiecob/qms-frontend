import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Prevents flickering on refresh
  }

  if (
    user?.Role === "student" ||
    user?.Role === "administrator" ||
    user?.Role === "staff"
  ) {
    return user ? <Navigate to="/queuelist" replace /> : children;
  } else {
    return user ? <Navigate to="/" replace /> : children;
  }
};

export default PublicRoute;
