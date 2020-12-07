const passport = require('passport');
const LocalStrategy = require('passport-local');
const Account = require('../account/account.model');
const { sendJSONresponse } = require('../helpers/jsonResponse');

// Setup options of local strategy
const localOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  failWithError: true,
  badRequestMessage: 'Please fill the form',
};

// Create local strategy
const localLogin = new LocalStrategy(
  localOptions,
  (req, email, password, done) => {
    Account.findOne({ email })
      .populate('jobExperience education skillArea', '_id name')
      .exec((err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'invalid email or password',
          });
        }
        // compare passwords - is 'password' equal to user.password?
        user.comparePassword(password, (err, isMatch) => {
          if (err) {
            return done(err);
          }
          if (!isMatch) {
            return done(null, false, {
              message: 'invalid email or password',
            });
          }
          return done(null, user);
        });
      });
  },
);

// Tell passport to use this strategy
passport.use(localLogin);

passport.serializeUser(function (user, done) {
  delete user.password;
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

// const requireLogin =
