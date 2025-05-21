const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const boardRoutes = require('./routes/board');
const problemRoutes = require('./routes/problems');
const usersRoutes = require('./routes/users');
const flagRouter = require('./routes/flag');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/users', usersRoutes);
app.use('/', flagRouter);

console.log('Problems route registered');
console.log('Users route registered');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 