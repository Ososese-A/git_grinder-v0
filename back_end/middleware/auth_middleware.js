const authCheck = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect("/home")
}

module.exports = { authCheck }