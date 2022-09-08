const helpersSession = {};

helpersSession.isAuthLogged = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();

    }

    req.flash('error', 'No autorizado!');
    req.session.destroy();
    res.redirect('/');
}

module.exports = helpersSession;