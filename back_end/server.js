require("dotenv").config()
const express = require("express")
const session = require("express-session")
const logger = require("./middleware/logger_middleware")
const passport = require("./strategies/github_strategy")
const mongoose = require("mongoose")
const userRoute = require("./routes/user_routes")
const authRoute = require("./routes/auth_routes")
const aiRoute = require("./routes/ai_routes")
const projectRoute = require("./routes/project_routes")
const taskRoute = require("./routes/task_routes")

const app = express()

app.use(express.json())
app.use(logger)
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    }
))
app.use(passport.initialize())
app.use(passport.session())


app.get("/home", (req, res) => {
    res.json({msg: "Welcome to git grinder"})
})

app.use(userRoute)

app.use("/auth", authRoute)

app.use(aiRoute)

app.use("/project", projectRoute)

app.use("/task", taskRoute)


const PORT = 8080 || process.env.PORT
mongoose.connect(process.env.MONGO_URI)
    .then(
        app.listen(PORT, () => {
        console.log(`Ready, connected to DB and listening at port: ${PORT}`)
    }))
    .catch((err) => {
        console.log(err.message)
    })