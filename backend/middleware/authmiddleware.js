const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // चेक कर रहे हैं कि हेडर में टोकन आ रहा है या नहीं
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // टोकन को वेरीफाई कर रहे हैं
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

      // यूजर की आईडी को रिक्वेस्ट ऑब्जेक्ट में डाल रहे हैं
      req.user = decoded; 
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };