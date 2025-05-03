const passport = require("passport")
const GitHubStrategy = require("passport-github2")
const axios = require("axios")
const User = require("../models/user_model")

passport.use( new GitHubStrategy (
    {
        clientID: process.env.GITCLIENT_ID,
        clientSecret: process.env.GITCLIENT_SECRET,
        callbackURL: "/auth/github/callback"
    }, 

    async (accessToken, refreshToken, profile, done) => {

        if (!accessToken || !profile) {
            throw new Error("An error occured")
        }

        let email = ""

        try {

            const emailResponse = await axios.get("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            const emailList = emailResponse.data

            email = emailList.find((email) => email.primary)?.email || emailList[0].email

            let user = await User.findOne({gitID: profile.id})

            if (!user) {
                user = await User.create({
                    gitID: profile.id,
                    username: profile.username,
                    profileUrl: profile.profileUrl,
                    profilePhoto: profile.photos[0]?.value,
                    email: email
                })
            }

            done(null, user)

        } catch (err) {
            console.log(err.message)
            done(err)
        }
    }
))

passport.serializeUser(
    (user, done) => {
        done(null, user._id)
    }
)

passport.deserializeUser(
    async (id, done) => {
        try {
            const user = await User.findById(id)
            done(null, user)
        } catch (err) {
            done(err)
        }
    }
)

module.exports = passport