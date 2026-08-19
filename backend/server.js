const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables (.env in backend or root)
dotenv.config();
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(__dirname, '.env') });
}
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const app = express();

// Connect Database
connectDB();

// 1. Body Parser & CORS Middleware (MUST be before any routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 2. Mount API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));


app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/tools', require('./routes/toolRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Tool Rental Management System API',
    database: 'MongoDB Atlas Connected'
  });
});

// 3. Catch-all 404 Handler for Unmatched API Routes (Ensures NO HTML error pages are returned)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route '${req.originalUrl}' not found`
  });
});

// 4. Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Tool Rental Backend Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`❌ Unhandled Rejection Error: ${err.message}`);
});
