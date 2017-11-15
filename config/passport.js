const LocalStratgey = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model
const User = mongoose.model('users');

// Match users
module.exports = function(passport){
  passport.use(new LocalStratgey({usernameField: 'email'}, (email, password, done) => {
    User.findOne({
      email: email
    }).then(user => {
      if(!user){
        return done(null, false, {message: 'No user found'});
      }

      // Match passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Password is incorrect. Please re-enter your password'});
        }
      })
    })
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}