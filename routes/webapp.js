const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jquery = require('jquery');
const moment = require('moment');
const router = express.Router();

// Load Helper
const {ensureAuthenticated} = require('../helpers/auth');

// Load user model
require('../models/Users');
const User = mongoose.model('users');

// Employee page
router.get('/employees', ensureAuthenticated, (req, res) =>{
  User.find({company: req.user.company})
    .sort({firstName:'asc'})
    .then(users => {
      res.render('webapp/employees', {
        users:users
      });
    });
});

// Edit employees route
router.get('/editemployees/:id', ensureAuthenticated, (req, res) =>{
  User.findOne({
    _id: req.params.id
  })
  .then(users => {
    res.render('webapp/editemployees', {
      users: users
    });
  });
});

//App homepage route
router.get('/homepage', ensureAuthenticated, (req, res) =>{
  res.render('webapp/homepage');
});

//App schedules route
router.get('/schedules', ensureAuthenticated, (req, res) =>{
  res.render('webapp/schedules');
});

//App reports route
router.get('/reports', ensureAuthenticated, (req, res) =>{
  res.render('webapp/reports');
});

//App setings route
router.get('/settings', ensureAuthenticated, (req, res) =>{
  res.render('webapp/settings');
});

//App add employee route
router.get('/addEmployee', ensureAuthenticated, (req, res) =>{
  res.render('webapp/addEmployee');
});

// Process add new employee form
router.post('/addNewEmployee', (req, res) =>{
  let errors = [];

  if(req.body.password != req.body.password2){
    errors.push({text: 'Passwords do not match. Please try again'});
  }
  if(req.body.password.length < 4){
    errors.push({text: 'Password must be at least 4 characters'});
  }
  if(!req.body.firstName){
    errors.push({text: 'Please enter a first name'});
  }
  if(!req.body.surname){
    errors.push({text: 'Please enter a surname'});
  }
  if(!req.body.email){
    errors.push({text: 'Please enter a work email address'});
  }
  if(!req.body.password){
    errors.push({text: 'Please enter a valid password'});
  }
  if(!req.body.password2){
    errors.push({text: 'Please confirm the password'});
  }
  if(!req.body.mobile){
    errors.push({text: 'Please enter a work mobile number'});
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
            res.redirect('/webapp/addEmployee');
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
              req.flash('success_msg', 'Employee has been added');
              res.redirect('/webapp/employees');
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

module.exports = router;