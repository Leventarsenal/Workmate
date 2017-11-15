// Bring in packages
const express = require('express');
const path = require('path');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const jquery = require('jquery');
const moment = require('moment');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const app = express();

// Load routes
const webapp = require('./routes/webapp');

// Passport config
require('./config/passport')(passport);

// Db config
const db = require('./config/database');

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;

// Connect to Mongoose
mongoose.connect(db.mongoURI, {
  useMongoClient: true
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// Load user model
require('./models/Users');
const User = mongoose.model('users');

// Handlebars Middleware - https://github.com/ericf/express-handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Body Parser Middleware - https://github.com/expressjs/body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/modules', express.static(path.join(__dirname, 'node_modules')))

// Method override middleware - https://github.com/expressjs/method-override
app.use(methodOverride('_method'));

// Express-session middleware - https://www.npmjs.com/package/express-session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Connect-flash middleware - https://github.com/jaredhanson/connect-flash
app.use(flash());

// Passport middleware - http://passportjs.org/docs
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Index route
app.get('/', (req, res) =>{
  const title = 'Workmate';
  res.render('index', {
    title: title
  });
});

// About route
app.get('/about', (req, res) =>{
  res.render('about');
});

// Features route
app.get('/features', (req, res) =>{
  res.render('features');
});

// Trial route
app.get('/trial', (req, res) =>{
  res.render('trial');
});

// Terms route
app.get('/terms', (req, res) =>{
  res.render('terms');
});

// Sign up route
app.get('/signup', (req, res) =>{
  res.render('signup');
});

// Process sigup form
app.post('/signup', (req, res) =>{
  let errors = [];

  if(req.body.password != req.body.password2){
    errors.push({text: 'Passwords do not match. Please try again'});
  }
  if(req.body.password.length < 4){
    errors.push({text: 'Password must be at least 4 characters'});
  }
  if(!req.body.firstName){
    errors.push({text: 'Please enter your first name'});
  }
  if(!req.body.surname){
    errors.push({text: 'Please enter your surname'});
  }
  if(!req.body.company){
    errors.push({text: 'Please enter the company you work for'});
  }
  if(!req.body.email){
    errors.push({text: 'Please enter your work email address'});
  }
  if(!req.body.password){
    errors.push({text: 'Please enter a valid password'});
  }
  if(!req.body.password2){
    errors.push({text: 'Please confirm your password'});
  }
  if(!req.body.mobile){
    errors.push({text: 'Please enter your work mobile number'});
  }
  if(req.body.mobile.length != 10){
    errors.push({text: 'The mobile number must be 10 charachters in length'});
  }

  if(errors.length > 0){
    res.render('signup', {
      errors: errors,
      firstName: req.body.firstName,
      surname: req.body.surname,
      company: req.body.company,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2,
      mobile: req.body.mobile
    });
  } else {
      User.findOne({email: req.body.email})
        .then(user => {
          if(user){
            req.flash('error_msg', 'Email already in use. Please try again');
            res.redirect('/signup');
          } else {
      const newUser = new User({
        firstName: req.body.firstName,
        surname: req.body.surname,
        company: req.body.company,
        email: req.body.email,
        password: req.body.password,
        mobile: req.body.mobile,
        address: req.body.address,
        position: req.body.position,
        dob: req.body.dob,
        admin: req.body.admin,
        scheduleManager: req.body.scheduleManager
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(users => {
              req.flash('success_msg', 'You have successfully signed up. Please sign in to access the application');
              res.redirect('/login');
            })
            .catch(err => {
              console.log(err);
              return;
            });
        });
      }); 
    }
  });
  }
});

// Edit user process
app.put('/users/:id', (req, res) => {
  let errors = [];
  
    if(req.body.password != req.body.password2){
      errors.push({text: 'Passwords do not match. Please try again'});
    }
    if(req.body.password.length < 4){
      errors.push({text: 'Password must be at least 4 characters'});
    }
    if(!req.body.firstName){
      errors.push({text: 'Please enter your first name'});
    }
    if(!req.body.surname){
      errors.push({text: 'Please enter your surname'});
    }
    if(!req.body.company){
      errors.push({text: 'Please enter the company you work for'});
    }
    if(!req.body.email){
      errors.push({text: 'Please enter your work email address'});
    }
    if(!req.body.password){
      errors.push({text: 'Please enter a valid password'});
    }
    if(!req.body.password2){
      errors.push({text: 'Please confirm your password'});
    }
    if(!req.body.mobile){
      errors.push({text: 'Please enter your work mobile number'});
    }
    if(req.body.mobile.length != 10){
      errors.push({text: 'The mobile number must be 10 charachters in length'});
    }
  
    if(errors.length > 0){
      res.render('signup', {
        errors: errors,
        firstName: req.body.firstName,
        surname: req.body.surname,
        company: req.body.company,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
        mobile: req.body.mobile
      });
    } else {
      User.findOne({
        _id: req.params.id
      })
      .then(users => {
        users.firstName = req.body.firstName;
        users.surname = req.body.surname;
        users.comapny = req.body.company;
        users.email = req.body.email;
        users.password = req.body.password;
        users.mobile = req.body.mobile;
        users.address = req.body.address;
        users.dob = req.body.dob;
        users.position = req.body.position;
        users.admin = req.body.admin;
        users.scheduleManager = req.body.scheduleManager;

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(users.password, salt, (err, hash) => {
            if(err) throw err;
            users.password = hash;
            users.save()
              .then(users => {
                req.flash('success_msg', 'User information updated');
                res.redirect('/webapp/employees');
              })
              .catch(err => {
                console.log(err);
                return;
              });
          });
        });
      });
    }
});

// Delete a user
app.delete('/users/:id', (req, res) => {
  User.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'User successfully removed');
      res.redirect('/webapp/employees');
    })
});

// Login route
app.get('/login', (req, res) =>{
  res.render('login');
});

// Login authentication
app.post('/login', (req, res, next) =>{
  passport.authenticate('local', {
    successRedirect: '/webapp/homepage',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Logout user
app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have successfully logged out');
  res.redirect('/login');
});

// Use routes
app.use('/webapp', webapp);

// Setting the port location
const port = process.env.PORT || 5000

// Looking to see if the server is running
app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});