const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/security');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const mpesaRoutes = require('./routes/mpesaRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Fail fast if critical secrets are missing - safer than starting with an
// insecure default JWT secret
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in .env. Refusing to start.');
  process.exit(1);
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('WARNING: EMAIL_USER/EMAIL_PASSWORD not set - the Contact Us form will fail to send.');
}



connectDB();

const app = express();

// Trust the first proxy hop (needed for correct client IPs behind a
// reverse proxy/load balancer in production, e.g. for rate limiting)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options,
// Strict-Transport-Security, hides X-Powered-By, etc.)
app.use(helmet());

// CLIENT_URL can hold one or more comma-separated origins, e.g.
// "https://www.thishorizon.name.ng,https://thishorizon.name.ng"
// Falls back to localhost for local development.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin header (health checks, curl, some
      // mobile clients) as well as any origin in the allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Strips any $ or . operators from req.body/query/params to block NoSQL
// injection attempts (e.g. { "email": { "$ne": null } })
app.use(mongoSanitize());

// Prevents HTTP Parameter Pollution (e.g. ?category=Beds&category=Sofas
// being used to bypass filters/validation)
app.use(hpp());

// General abuse/flood protection across all API routes
app.use('/api', generalLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes)

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
