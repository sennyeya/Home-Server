require('dotenv').config()

const express = require('express')
const app = express()
const port = 4000;
const cors = require('cors')
const path = require("path")
const mongoose = require('mongoose');
const passport = require('passport');
require("passport-local")
const {spawn} = require('child_process')
var cookieSession = require("cookie-session")
const bodyParser = require('body-parser');
const fs = require('fs');

const {User} = require('./models/user');
const {Profile} = require('./models/Profile');

const {ensureIndexes} = require('./middleware/models');
const {errorHandler} = require('./middleware/errors');

const authenticated = require('./routes/authenticated');

mongoose.connect('mongodb://localhost:27017/home_server', {useNewUrlParser: true});

spawn('node', ['src/registerIp.js'])

let hosts = fs.readFileSync('known_hosts.txt').toString().split("\n").map(host=>{
    if(!host){
        return "http://localhost:3001"
    }else{
        return "http://"+host+":3001"
    }
});

app.use(cors({credentials: true, origin: hosts}));

app.use(cookieSession({
    name: 'HomeServer',
    keys: [process.env.SESSION_SECRET],
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}));
app.use(bodyParser.urlencoded({
    extended: true, 
    limit: '50mb',
    parameterLimit: 100000 
}));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());
app.use(ensureIndexes)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/public', express.static(path.join(__dirname, 'public')));

const ensureAuthenticated = async (req, res, next)=>{
    // Simple middleware to ensure user is authenticated.
    // Use this middleware on any resource that needs to be protected.
    // If the request is authenticated (typically via a persistent login session),
    // the request will proceed.  Otherwise, the user will be redirected to the
    // login page.
    if (req.user) {
        // Create a profile for each user on login if they don't have on.
        let profile = await Profile.findOne(req.user.profile).exec()
        if(!profile){
            profile = new Profile({});
            await profile.save();
            let user = await User.findById(req.user.id).exec();
            user.profile = profile;
            await user.save()
            req.user = user;
        }
        return next(); 
    }
    res.status(401).json({message:"No user found."})
}

app.use('/api', ensureAuthenticated, authenticated);

app.post('/login', async (req, res)=>{
    if(req.user){
        res.status(200).json({username:req.user.username, viewed: req.user.viewed})
    }else{
        passport.authenticate('local', function (err, user, info) {
            if(err){ 
              res.status(400).json({message: err}) 
            } else{ 
             if (! user) { 
               res.status(400).json({message: 'username or password incorrect'}) 
             } else{ 
               req.login(user, function(err){
                 if(err){ 
                   res.status(401).json({message: err}) 
                 }else{ 
                   res.status(200).json({username:user.username, viewed:user.viewed});
                 } 
               }) 
             } 
            } 
         })(req, res); 
    }
})

/**
 * Use this to create an account, it is currently disabled.
 * Uses the passport-local-mongoose middleware.
 * @param {String} req.body.username username
 * @param {String} req.body.password password
 */
app.post('/create_account', async (req, res)=>{
    res.sendStatus(404);
    return;
    if(!req.body.username){
        res.status(400).json({message:"Missing username"})
        return;
    }else if(!req.body.password){
        res.status(400).json({message:"Missing password"});
        return;
    }
    let user = new User({username:req.body.username});
    User.register(user, req.body.password, (err)=>{
        if(err){
            res.send(401).json({message:err})
        }else{
            res.send(200)
        }
    })
})

// Asserts that the req.user objects exists and returns if available.
app.get('/is_auth', (req, res)=>{
    if(req.user){
        res.status(200).json({user:req.user})
    }else{
        res.sendStatus(401)
    }
})

// Custom error handler that prints errors to console.
app.use(errorHandler)

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))