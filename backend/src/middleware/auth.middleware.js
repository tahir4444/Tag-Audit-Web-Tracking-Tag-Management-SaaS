import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
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