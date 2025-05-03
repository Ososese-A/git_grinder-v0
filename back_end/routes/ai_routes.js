const express = require("express")
const OpenAI = require("openai")
const fs = require("fs/promises")

const router = express.Router()

router.post("/aiTasker", async (req, res) => {
    const openai = new OpenAI({
    apiKey: process.env.OPAI_KEY,
    })

    const userInstructions = req.body.userInstructions

    const instructions = await fs.readFile("prompt.txt", "utf8")
    console.log(userInstructions)


    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            store: true,
            messages: [
                { 
                    "role": "system", 
                    "content": instructions
                },

                { 
                    "role": "user", 
                    "content": userInstructions
                },
            ],
        });

        const aiResponse = completion.choices[0].message
        console.log(aiResponse)
        const userProjectSteps = aiResponse.content.split("\n")
        // const formatedAIContent = aiContent
        //     .map(item => item.replace(/\*\*/g, '').trim())
        //     .filter(item => item !== " " || item !== "")

        // let currentStep = null
        // const userProjectSteps = []

        // formatedAIContent
        //     .forEach( item => {
        //         if (/^#*\s*Step\s\d+:/i.test(item)) {
        //             currentStep = { step: item.replace(/^#*\s*/, ''), substeps: [], timeline: []}
        //             userProjectSteps.push(currentStep)
        //         } else if (currentStep && item.startsWith('- Time:')) {
        //             currentStep.timeline.push(item.replace('- Time:', '').trim())
        //         } else if (currentStep && (item.startsWith('-'))) {
        //             currentStep.substeps.push(item.replace('- ', '').trim())
        //         } else if (currentStep && (item.startsWith('#'))) {
        //             currentStep.substeps.push(item.replace(/^#*\s*/, '').trim())
        //         }
        //     })

        console.log(userProjectSteps)

        if (userProjectSteps[0] == "I'm sorry, but I can't assist with that.") { 
            console.log("ERROR:", "Sorry but we cannot help you with this kind of project")
            return res.json({msg: "Sorry but we cannot help you with this kind of project"})
        }

        res.status(200).json({msg:  userProjectSteps})
    } catch (err) {
        console.error("An error occurred:", err.message);
        res.status(500).json({error: err.message})
    }
})

router.post("/aiSuggestion", async (req, res) => {
    const openai = new OpenAI({
        apiKey: process.env.OPAI_KEY,
    })

    const userInstructions = req.body.userInstructions

    const instructions = await fs.readFile("suggestion.txt", "utf8")

    try {
        const completion = await openai.chat.completions.create({
            model:"gpt-4o-mini",
            store: true,
            messages: [
                {
                    "role": "system",
                    "content": instructions
                },

                {
                    "role": "user",
                    "content": userInstructions
                }
            ]
        })

        const aiResponse = completion.choices[0].message
        console.log(aiResponse)
        const aiContent = aiResponse.content.split("\n")

        console.log(aiContent)

        res.status(200).json(aiContent)
    } catch (err) {
    }
})

module.exports = router