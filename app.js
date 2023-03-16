require('dotenv').config()
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 1000

// db and routers connection
require('./db/connection')
const userRoute = require('./routes/userRoutes');


app.use(morgan('dev'));
app.use(cookieParser())
app.use(cors({credentials: true, origin: "http://localhost:3000"}));
app.use(express.json());
app.use('/api', userRoute);


app.listen(PORT, () => {
    console.log(`app is listening on port ${PORT}`);
})