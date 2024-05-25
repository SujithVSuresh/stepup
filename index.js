const express = require("express");
const path = require("path");
const adminRouter = require('./routes/adminRoute')
const userRouter = require('./routes/userRoute')
const db = require('./config/db')
const nocache = require('nocache')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid');
const User = require('./models/userModel')
const auth = require('./middleware/userAuth')

//passport
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv'); 


dotenv.config();


const app = express();

app.set("view engine", "ejs");


app.use(nocache());


//setting session
app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: false
}));

//passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Serving static files.
app.use("/static", express.static(path.join(__dirname, "public")));



//mounting routes
app.use('/admin', adminRouter)
app.use('/', userRouter)


//passport
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {


  let manageAuth = async () => {

    try {
      const user = await User.findOne({ email: profile._json.email });
      if (!user) {

        const newUser = new User({
          firstName: profile._json.given_name,
          lastName: profile._json.family_name,
          email: profile._json.email ,
          isBlocked: false,
          dateJoined: Date()
        });
        
        await newUser.save();

        req.session.userId = newUser._id


        return done(null, newUser);
      }
      req.session.userId = user._id
      return done(null, user);
    } catch (error) {

      console.error("Error during user logic:", error);
      return done(error);
    }

  }

  manageAuth()

}));


app.get('/auth/google',  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/signin'
}));

app.get('/auth/destroy-otp', (req, res) => {
  delete req.session.otp;
  res.send(200).json({"message": "OTP destroyed"})

});


app.listen("3000", () => {
  console.log("Server has started");
});
