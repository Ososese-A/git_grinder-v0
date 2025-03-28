require("dotenv").config()
const express = require("express")
const userTimelineQueryHelper = require("./userTimelineQueryHelper")
const fs = require('fs')
const path =  require("path")
const cors = require("cors")

const app = express()
const corsOptions = {
    origin: "http://localhost:5173/",
    methods: "GET, POST",
    allowedHeaders: "Content-Type, Authorization"
}

app.use(cors())
// app.use(cors(corsOptions))
app.use(express.json())

app.use((req, res, next) => {
    const path = req.path
    const method = req.method
    console.log(`Path: ${path}\n Method: ${method}`)
    next()
})

const API_URL = process.env.API_URL
const TOKEN = process.env.TOKEN

app.get("/", (req, res) => {
    res.send("Hello")
})

app.get("/mockRoute/:username", async (req, res) => {
    const username = req.params.username
    const query = {
        query: userTimelineQueryHelper(username)
    }

    const users = ["WisdomLota", "Ososese-A"]
    if (!users.includes(username)) {
        res.status(404).json({errorMsg: "User not found"})
    }

    const directoryPath = path.join(__dirname, "mock_data")
    const filePath = (username == users[0]) ? path.join(directoryPath, "mock_w.json") : path.join(directoryPath, "mock_o.json")

    try {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.log(err)
                    res.status(500).json({errorMsg: "It's not you it's us, an error occured on our end please try again"})
                } else {
                try {
                    const parsedData = JSON.parse(data)
                    res.status(200).json(parsedData)
                } catch (parseErr) {
                    console.log('Error parsing JSON data: ' + parseErr)
                }
                }
            })
    } catch (err) {
        res.status(500).json({error: `${err.message}`})
    }
})

app.get("/timeline/:username", async (req, res) =>{
    const username = req.params.username

    const query = {
        query: userTimelineQueryHelper(username)
    }

    try {

        const result = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        })

        const data = await result.json()
        console.log("total contributions")
        console.log(data.data.user.contributionsCollection.contributionCalendar.totalContributions)
        console.log("Number of weeks")
        console.log(data.data.user.contributionsCollection.contributionCalendar.weeks.length)
        res.status(200).json(data)

    } catch (err) {

        console.log(err)
        const error = `${err.message}`
        res.status(500).json(error)

    }
})

const PORT = 8080 || process.env.PORT
app.listen(PORT, () => {
    console.log(`Live and running at port ${PORT}`)
})