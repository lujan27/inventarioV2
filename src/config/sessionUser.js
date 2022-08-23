const helpersUser = {};

helpersUser.isAuthUser = (req, res, next) => {
    if(req.isAuthenticated()&&req.user.role=='usuario'){
        return next();
    }

    req.flash('error', 'No autorizado!');
    req.session.destroy();
    res.redirect('/');
}

module.exports = helpersUser;