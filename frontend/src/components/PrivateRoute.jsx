import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Show loading state while checking authentication
  if (isAuthenticated === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log('PrivateRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If authenticated and user exists, render children
  console.log('PrivateRoute: Authenticated, rendering protected content');
  return <>{children}</>;
};

export default PrivateRoute; 