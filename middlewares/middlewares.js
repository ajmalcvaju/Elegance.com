const checkSession = (req, res, next) => {
    if (req.session && req.session.email) {
        return res.redirect('/');
    }
    next();
}
const checkSession2 = (req, res, next) => {
    if (req.session && req.session.email) {
        return res.redirect('/');
    }
    next();
};
const checkSession3 = (req, res, next) => {
    if (req.session && req.session.email) {
        return res.redirect('/admin/dashboard');
    }
    next();
};

module.exports={ checkSession,checkSession2,checkSession3 }