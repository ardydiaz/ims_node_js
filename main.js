//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const productRoutes = require('./routes/routes');


const app = express();
const PORT = process.env.PORT || 4000;


// MongoDB Connection
mongoose.connect(process.env.DB_URI,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to the database'))
    .catch((error) => console.error('Database connection error:', error));


//middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//set session
app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
    cookie: { secure: false, httpOnly: true }
}));

//this is for the session
app.use((req, res, next) => {
    next();
});

app.use(express.static('uploads')); //get image upload path

//set template engine
app.set('view engine', 'ejs');

//route prefix
app.use('/', productRoutes);


//set port
app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`)
});