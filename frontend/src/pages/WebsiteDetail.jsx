import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import axios from 'axios';

const WebsiteDetail = () => {
  const { id } = useParams();
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const { data: website, isLoading: websiteLoading } = useQuery({
    queryKey: ['website', id],
    queryFn: async () => {
      const response = await axios.get(`/api/websites/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
  });

  const { data: audits, isLoading: auditsLoading } = useQuery({
    queryKey: ['audits', id],
    queryFn: async () => {
      const response = await axios.get(`/api/audits/website/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
  });

  const startAudit = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `/api/audits/website/${id}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['audits', id]);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to start audit');
    },
  });

  if (websiteLoading || auditsLoading) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {website?.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Website Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Website Details
            </Typography>
            <Typography>
              <strong>URL:</strong> {website?.url}
            </Typography>
            <Typography>
              <strong>Platform:</strong> {website?.platform}
            </Typography>
            <Typography>
              <strong>Created:</strong>{' '}
              {new Date(website?.createdAt).toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={() => startAudit.mutate()}
              disabled={startAudit.isLoading}
            >
              {startAudit.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Start New Audit'
              )}
            </Button>
          </Paper>
        </Grid>

        {/* Audit History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Audit History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Findings</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Array.isArray(audits) ? audits : []).map((audit) => (
                    <TableRow key={audit._id}>
                      <TableCell>
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={audit.status}
                          color={getStatusColor(audit.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {audit.findings?.length || 0} findings
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() =>
                            window.open(
                              `/api/audits/${audit._id}/report`,
                              '_blank'
                            )
                          }
                        >
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WebsiteDetail;
