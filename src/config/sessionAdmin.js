const helpersAdmin = {};

helpersAdmin.isAuthAdmin = (req, res, next) => {
    if(req.isAuthenticated()&&req.user.role=='administrador'){
        return next();
    }
    
    req.flash('error', 'No autorizado!');
    req.session.destroy();
    res.redirect('/');
    
};

module.exports = helpersAdmin;