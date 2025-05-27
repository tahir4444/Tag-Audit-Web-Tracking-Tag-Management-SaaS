import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log('No Authorization header');
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token format check:', token ? 'Valid format' : 'Invalid format');
    
    if (!token) {
      console.log('No token after Bearer removal');
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    try {
      console.log('Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, userId:', decoded.userId);
      
      const user = await User.findOne({ _id: decoded.userId });
      console.log('User lookup result:', user ? 'Found' : 'Not found');

      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ error: 'User not found' });
      }

      req.token = token;
      req.user = user;
      console.log('Auth successful for user:', user.email);
      next();
    } catch (jwtError) {
      console.log('JWT verification failed:', {
        name: jwtError.name,
        message: jwtError.message,
        expiredAt: jwtError.expiredAt
      });
      return res.status(401).json({ 
        error: 'Invalid authentication token',
        details: jwtError.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const subscriptionCheck = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.subscription.status !== 'active') {
        return res.status(403).json({ 
          error: 'Subscription required.',
          subscription: req.user.subscription
        });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export {
  auth,
  adminAuth,
  subscriptionCheck
}; 