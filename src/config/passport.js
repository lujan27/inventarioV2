const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel');

passport.use(new LocalStrategy({
    usernameField: 'username'
}, async (username, password, done) => {
    const user = await User.findOne({username: username});
    console.log(user);
    if(!user){
        return done(null, false, {message: 'Usuario no encontrado'});
    } else {
        const match = await user.matchPassword(password);
        if(match){
            return done(null, user);
        } else {
            return done(null, false, {message: 'Contraseña incorrecta'});
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) =>{
    User.findById(id, (err, user) =>{
        done(err, user);
    });
});