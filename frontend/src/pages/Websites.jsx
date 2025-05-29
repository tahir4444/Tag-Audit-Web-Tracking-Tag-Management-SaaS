import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Tooltip,
  Chip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Web as WebIcon,
  Language as LanguageIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../utils/axios';

const MotionCard = motion(Card);

const Websites = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    platform: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const {
    data: websites = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await axios.get('/websites', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.websites || [];
      } catch (error) {
        if (error.response?.status === 401) {
          // Redirect to login if unauthorized
          navigate('/login');
        }
        throw error;
      }
    },
  });

  const createWebsite = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.post('/websites', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['websites']);
      setOpen(false);
      setFormData({ name: '', url: '', platform: '' });
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setError(error.response?.data?.error || 'Failed to create website');
    },
  });

  const deleteWebsite = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await axios.delete(`/websites/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['websites']);
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    },
  });

  const startAudit = useMutation({
    mutationFn: async (websiteId) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.post(
        `/audits/website/${websiteId}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, websiteId) => {
      queryClient.invalidateQueries(['websites']);
      // Navigate to the audit details page
      navigate(`/websites/${websiteId}/audits/${data.audit._id}`);
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setError(error.response?.data?.error || 'Failed to start audit');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createWebsite.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: 'calc(100vh - 64px)', // Subtract AppBar height
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        overflow: 'hidden',
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Websites
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{
            borderRadius: 2,
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          Add Website
        </Button>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {fetchError.message || 'Error loading websites'}
        </Alert>
      )}

      {websites.length === 0 ? (
        <Paper
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
            textAlign: 'center',
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            minHeight: { xs: '300px', sm: '400px' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 3,
            mx: { xs: -2, sm: 0 }, // Negative margin on mobile to extend full width
          }}
        >
          <WebIcon
            sx={{
              fontSize: { xs: 60, sm: 80 },
              color: theme.palette.primary.main,
              mb: { xs: 2, sm: 3 },
            }}
          />
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            No Websites Added Yet
          </Typography>
          <Typography
            variant="h6"
            color="textSecondary"
            paragraph
            sx={{
              maxWidth: '600px',
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              px: { xs: 2, sm: 0 },
            }}
          >
            Start by adding your first website to begin tracking and auditing
            tags. We'll help you monitor and optimize your website's
            performance.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: 2,
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
              },
            }}
          >
            Add Website
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
          {websites.map((website, index) => (
            <Grid item xs={12} sm={6} md={4} key={website._id}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <WebIcon
                      sx={{
                        fontSize: { xs: 32, sm: 40 },
                        color: theme.palette.primary.main,
                        mr: 2,
                      }}
                    />
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      }}
                    >
                      {website.name}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography
                      color="textSecondary"
                      noWrap
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      {website.url}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <CodeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      Platform: {website.platform}
                    </Typography>
                  </Box>

                  {website.lastAudit && (
                    <Box display="flex" alignItems="center">
                      <AssessmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        Last Audit:{' '}
                        {new Date(website.lastAudit.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  {website.lastAudit?.status && (
                    <Box mt={2}>
                      <Chip
                        label={website.lastAudit.status}
                        color={
                          website.lastAudit.status === 'completed'
                            ? 'success'
                            : website.lastAudit.status === 'in_progress'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: { xs: 1.5, sm: 2 }, pt: 0 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/websites/${website._id}`)}
                    sx={{
                      borderRadius: 2,
                      px: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      '&:hover': {
                        boxShadow: 3,
                      },
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => startAudit.mutate(website._id)}
                    disabled={startAudit.isLoading}
                    sx={{
                      borderRadius: 2,
                      px: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      ml: 1,
                    }}
                  >
                    {startAudit.isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      'Start Audit'
                    )}
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/websites/${website._id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteWebsite.mutate(website._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Add New Website
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Website Name"
              type="text"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="url"
              label="Website URL"
              type="url"
              fullWidth
              value={formData.url}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="platform"
              label="Platform"
              type="text"
              fullWidth
              value={formData.platform}
              onChange={handleChange}
              required
              helperText="e.g., WordPress, Shopify, Custom"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={() => setOpen(false)}
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createWebsite.isLoading}
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              {createWebsite.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Add Website'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Websites;
