import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import { join } from 'path';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieSession from 'cookie-session';

import { User } from './models/User.model';
import { Profile } from './models/Profile.model';

import { ensureIndexes } from './middleware/models';
import { errorHandler } from './middleware/errors';
import authenticated from './routes/authenticated';

const app = express();
const port = 4000;

mongoose.connect('mongodb://192.168.0.21:27017/home_server', {
  useNewUrlParser: true,
});

app.use(cors());

app.use(
  cookieSession({
    name: 'HomeServer',
    keys: [process.env.SESSION_SECRET],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());
app.use(ensureIndexes);

app.use('/public', express.static(join(__dirname, 'public')));

const ensureAuthenticated = async (req, res, next) => {
  // Simple middleware to ensure user is authenticated.
  // Use this middleware on any resource that needs to be protected.
  // If the request is authenticated (typically via a persistent login session),
  // the request will proceed.  Otherwise, the user will be redirected to the
  // login page.
  if (req.user) {
    // Create a profile for each user on login if they don't have on.
    let profile = await Profile.findOne(req.user.profile).exec();
    if (!profile) {
      profile = new Profile({});
      await profile.save();
      let user = await User.findById(req.user.id).exec();
      user.profile = profile;
      await user.save();
      req.user = user;
    }
    return next();
  }
  res.status(401).json({ message: 'No user found.' });
};

app.use('/api', ensureAuthenticated, authenticated);

app.post('/login', async (req, res) => {
  if (req.user) {
    res
      .status(200)
      .json({ username: req.user.username, viewed: req.user.viewed });
  } else {
    passport.authenticate('local', function (err, user, info) {
      console.log({ user, err, info });
      if (err) {
        res.status(400).json({ message: err });
      } else {
        if (!user) {
          res
            .status(400)
            .json({ message: 'username or password incorrect' });
        } else {
          req.login(user, function (err) {
            if (err) {
              res.status(401).json({ message: err });
            } else {
              res.status(200).json({ user });
            }
          });
        }
      }
    })(req, res);
  }
});

app.get('/logout', async (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

/**
 * Use this to create an account, it is currently disabled.
 * Uses the passport-local-mongoose middleware.
 * @param {String} req.body.username username
 * @param {String} req.body.password password
 */
app.post('/create_account', async (req, res) => {
  res.sendStatus(404);
  return;
  if (!req.body.username) {
    res.status(400).json({ message: 'Missing username' });
    return;
  } else if (!req.body.password) {
    res.status(400).json({ message: 'Missing password' });
    return;
  }
  let user = new User({ username: req.body.username });
  User.register(user, req.body.password, (err) => {
    if (err) {
      res.send(401).json({ message: err });
    } else {
      res.send(200);
    }
  });
});

// Asserts that the req.user objects exists and returns if available.
app.get('/is_auth', (req, res) => {
  if (req.user) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ err: true, errMessage: 'No user found.' });
  }
});

// Custom error handler that prints errors to console.
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`),
);
