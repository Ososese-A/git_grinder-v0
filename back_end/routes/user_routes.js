const express = require("express")
const { authCheck } = require("../middleware/auth_middleware")
const { User, GrinderGoal, SavedProjects } = require("../models/user_model")

const router = express.Router()

router.get("/dashboard", authCheck, (req, res) => {
    console.log("from the dashboard")
    console.log(req.user)
    res.status(200).json({msg: `username ${req.user.username}, Id ${req.user._id}`})
})

// router.patch("/selectCurrentProject/:id", authCheck, (req, res) => {
router.patch("/selectCurrentProject/:id", async (req, res) => {
    const mockId = "680910ab8cb4cb70e7c6a48d"
    // const userId = req.user._id

    const { projectId } = req.params.id

    if (!isValidObjectId(mockId)) return res.status(404).json({msg: "User not found, the id is invalid"})

    if (!projectId) return res.status(404).json({msg: "User not found, the id is invalid"})

    try {
        const selected = await User.findByIdAndUpdate(
            mockId,
            {
                ongoingProject: projectId
            }
        )

        res.status(200).json({ msg: "Project selected successfully", selected })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.post("/grinderGoal/:id", authCheck, async (req, res) => {
router.post("/grinderGoal", async (req, res) => {
    const mockId = "680910ab8cb4cb70e7c6a48d"
    // const userId = req.user._id

    const { grinderGoal } = req.body

    if (!isValidObjectId(mockId)) return res.status(404).json({msg: "User not found, the id is invalid"})

    try {
        const goal = await GrinderGoal.create({
            $set: grinderGoal
        })

        const user = await User.findById(mockId)

        user.grinderGoal.push(goal._id)

        res.status(201).json({ msg: "Grinder goal set successfully", goal })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.get("/grinderGoal", authCheck, async (req, res) => {
router.get("/grinderGoal", async (req, res) => {
    const mockId = "680910ab8cb4cb70e7c6a48d"
    // const userId = req.user._id

    if (!isValidObjectId(mockId)) return res.status(404).json({msg: "User not found, the id is invalid"})
    
    try {
        const user = await User.findById(mockId)

        //assuming the id will always be added at the top of the array
        const goalId = user.grinderGoal[0]

        const goal = await GrinderGoal.findById(goalId)

        res.status(200).json({ msg: "This is the user's goal", goal })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.post("/projectSuggestion", authCheck, async (req, res) => {
router.post("/projectSuggestion", async (req, res) => {
    const userId = "680910ab8cb4cb70e7c6a48d" || req.user._id

    //get the suggestion from the body 
    const { projectSuggestion } = req.body

    if (!projectSuggestion || projectSuggestion.length < 1) return res.status(404).json({ msg: "Project suggestion to be saved is required" })

    if (!isValidObjectId(userId)) return res.status(404).json({msg: "User not found, the id is invalid"})
    
    try {
        let suggestionIds = []
        await Promise.all(
            projectSuggestion.map(async suggestion => {
                const suggestionRes = await SavedProjects.create(suggestion)
                suggestionIds.push(suggestionRes._id)
            })
        )

        //add them to the array
        await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    savedProjects: {
                        $each: suggestionIds
                    }
                }
            }
        )

        res.status(200).json({ msg: "Project saved successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.get("/projectSuggestion", authCheck, async (req, res) => {
router.get("/projectSuggestion", async (req, res) => {
    const userId = "680910ab8cb4cb70e7c6a48d" || req.user._id

    if (!isValidObjectId(userId)) return res.status(404).json({msg: "User not found, the id is invalid"})

    try {
        const savedProjects = await User.findById(userId).select("savedProjects").populate("savedProjects")

        res.status(200).json({ msg: "This is it", savedProjects })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router