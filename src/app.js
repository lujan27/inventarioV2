const methodoverride = require('method-override');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();

const ordersModel = require('./models/ordersModel');

// Initializations
const app = express();
require('./config/passport');
const port = process.env.PORT || 3000;

// Settings
app.listen(port, () => console.log(`Server running at:\x1b[36m http://localhost:${port}\x1b[0m`));

// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(methodoverride('_method'));
app.use(cookieParser('SecretStringForCookies'));
app.use(session({
    secret: 'mysecretapp',
    // cookie: {maxAge: 60000}, Allow the session to be 1 min active
    resave: true,
    saveUninitialized: true
}));

// Usar la carpeta assets para acceder a /css, /img, /js, etc.
app.use(express.static(path.join(__dirname, 'assets')))

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// View engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Global variables
app.use(async (req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.success_msg = req.flash('success_msg');
    res.locals.danger_msg = req.flash('danger_msg');
    res.locals.user = req.user || null;
    res.locals.contAdmin = await ordersModel.aggregate([
        {
          '$match': {
            'status': {
              '$ne': 'Solicitado'
            }
          }
        }, {
          '$match': {
            'status': {
              '$ne': 'Rechazada'
            }
          }
        }, {
          '$match': {
            'status': {
              '$ne': 'Aceptada'
            }
          }
        }, {
          '$count': 'status'
        }
      ]) || null;
    next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/admin'));
app.use(require('./routes/coord'));
app.use(require('./routes/user'));
app.use(require('./routes/util'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true /*useCreateIndex: true*/})
    .then(() => console.log(`Connected to MongoDB Atlas \n`))
    .catch((error) => console.error(error));
    