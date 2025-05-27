import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Web as WebIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../utils/axios';

const MotionCard = motion(Card);

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: websites = [], isLoading: websitesLoading, error: websitesError } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      const response = await axios.get('/websites');
      return response.data.websites || [];
    },
  });

  const { data: audits = [], isLoading: auditsLoading, error: auditsError } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      try {
        const response = await axios.get('/audits');
        console.log('Audits response:', response.data);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching audits:', error);
        throw error;
      }
    },
  });

  // Use useMemo to calculate stats
  const stats = useMemo(() => ({
    totalWebsites: websites.length,
    totalAudits: audits.length,
    recentAudits: audits.slice(0, 5), // Get 5 most recent audits
    issuesFound: audits.reduce((total, audit) => total + (audit.issues?.length || 0), 0),
  }), [websites.length, audits]);

  if (websitesLoading || auditsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (websitesError || auditsError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {websitesError?.message || auditsError?.message || 'Error loading dashboard data'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/websites')}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          Add Website
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WebIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Websites</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats.totalWebsites}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssessmentIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Audits</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats.totalAudits}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)`,
              color: 'white',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Success Rate</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats.totalAudits > 0
                  ? `${Math.round((stats.totalAudits - stats.issuesFound) / stats.totalAudits * 100)}%`
                  : '0%'}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, #ff9800 0%, #f57c00 100%)`,
              color: 'white',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Issues Found</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats.issuesFound}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Recent Audits */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Recent Audits
              </Typography>
              <Tooltip title="Refresh">
                <IconButton>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {stats.totalWebsites === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No websites added yet. Add your first website to start tracking tags.
              </Alert>
            ) : stats.recentAudits.length === 0 ? (
              <Alert severity="info">
                No audits found. Run an audit on your website to see results here.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {stats.recentAudits.map((audit, index) => (
                  <Grid item xs={12} md={6} lg={4} key={audit._id}>
                    <MotionCard
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {audit.website.name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          Date: {new Date(audit.date).toLocaleDateString()}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          Status: {audit.status}
                        </Typography>
                        {audit.issues && (
                          <Typography color="textSecondary">
                            Issues: {audit.issues.length}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={() => navigate(`/websites/${audit.website._id}`)}
                          sx={{ ml: 'auto' }}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/websites')}
                  sx={{
                    px: 3,
                    py: 1,
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  {stats.totalWebsites === 0 ? 'Add Website' : 'Manage Websites'}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/subscription')}
                  sx={{
                    px: 3,
                    py: 1,
                  }}
                >
                  View Subscription
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 