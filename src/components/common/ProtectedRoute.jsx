import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import useAuthStore from "../../store/authstore";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    // You can replace this with a loading spinner component
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary_green"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired, // Specify that children is required
};
