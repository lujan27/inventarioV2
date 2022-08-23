const helpersCoord = {};

helpersCoord.isAuthCoord = (req, res, next) => {
    if(req.isAuthenticated()&&req.user.role=='coordinador'){
        return next();
    }

    req.flash('error', 'No autorizado!');
    req.session.destroy();
    res.redirect('/');
}

module.exports = helpersCoord;