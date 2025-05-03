const express = require("express")
const passport = require("../strategies/github_strategy")

const router = express.Router()

router.get("/github", passport.authenticate("github", { scope: ["user:email", "read:user", "repo"] }))

router.get("/github/callback", 
    passport.authenticate("github", {failureRedirect: "/home"}),
    (req, res) => {
        // res.status(200).json({msg: "Successful Login"})
        console.log("Git hub callback")
        console.log("Authenticated user:", req.user.email)
        res.redirect("/dashboard")
    }
)

router.get("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) {
            console.log(err.message)
            return res.status(500).json({msg: "Logout failed"})
        }

        req.session.destroy((err) => {
            if (err) {
                console.log("Error destroying session:", err.message)
                return res.status(500).json({msg: "Session destruction failed"})
            }

            res.clearCookie("connect.sid")
            res.status(200).json({msg: "Logout successful"})
        })
    })
})

module.exports = router