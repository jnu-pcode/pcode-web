const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const houseRoutes = require('./routes/house');
const boardRoutes = require('./routes/board');
const problemsRoutes = require('./routes/problems');
const usersRoutes = require('./routes/users');
const flagRouter = require('./routes/flag');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/house', houseRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api', flagRouter);


// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
};

console.log('Database Config:', {
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  password: dbConfig.password ? '****' : undefined,
  port: dbConfig.port
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 