import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';

const Subscription = () => {
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await axios.get('/subscriptions/status');
      return response.data.subscription;
    },
  });

  const createSubscription = useMutation({
    mutationFn: async (planId) => {
      const response = await axios.post('/subscriptions/create', {
        planId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to create subscription');
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      await axios.post('/subscriptions/cancel');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to cancel subscription');
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      features: [
        'Basic tag auditing',
        'Manual fixes',
        'Weekly audits',
        'Up to 1 website'
      ],
      limitations: [
        'No automatic fixes',
        'No email notifications',
        'No API access'
      ],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$29',
      features: [
        'Up to 5 websites',
        'Advanced tag auditing',
        'Automatic fixes',
        'Daily audits',
        'Email notifications'
      ],
      limitations: [
        'No priority support',
        'No API access',
        'No custom audit schedules'
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$99',
      features: [
        'Up to 20 websites',
        'All Basic features',
        'Priority support',
        'Custom audit schedules',
        'API access'
      ],
      limitations: [],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$299',
      features: [
        'Up to 100 websites',
        'All Premium features',
        'Dedicated support',
        'Custom integrations',
        'White-label reports'
      ],
      limitations: [],
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Subscription
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {subscription?.status === 'active' && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Plan: {subscription.plan}
          </Typography>
          <Typography>
            Status: <strong>{subscription.status}</strong>
          </Typography>
          {subscription.endDate && (
            <Typography>
              Next billing date:{' '}
              {new Date(subscription.endDate).toLocaleDateString()}
            </Typography>
          )}
          <Button
            variant="outlined"
            color="error"
            onClick={() => cancelSubscription.mutate()}
            disabled={cancelSubscription.isLoading}
            sx={{ mt: 2 }}
          >
            {cancelSubscription.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Cancel Subscription'
            )}
          </Button>
        </Paper>
      )}

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={3} key={plan.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {plan.price}
                  <Typography
                    component="span"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    /month
                  </Typography>
                </Typography>
                <List>
                  {plan.features.map((feature) => (
                    <ListItem key={feature} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <ListItem key={limitation} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CloseIcon color="error" />
                      </ListItemIcon>
                      <ListItemText primary={limitation} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => createSubscription.mutate(plan.id)}
                  disabled={createSubscription.isLoading}
                >
                  {createSubscription.isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Subscription; 