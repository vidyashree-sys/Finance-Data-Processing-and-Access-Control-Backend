require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB(); //connect to database

//middlewares
app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/userRoutes.js'));

//routes
app.get('/', (req,res) => {
    res.send("Finance API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on the port ${PORT}`)
});

