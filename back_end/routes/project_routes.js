const express = require("express")
const router = express.Router()
const Project = require("../models/project_model")
const User = require("../models/user_model")
const { isValidObjectId } = require("mongoose")
const { authCheck } = require("../middleware/auth_middleware")
const { Task, SubTask } = require("../models/task_model")

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//REMEMBER TO CHANGE FROM MOCK ID TO MAIN ID
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

// router.post("/create", authCheck, async (req, res) => {
router.post("/create", async (req, res) => {
    const {tasks, sideNotes, specifications,  description} = req.body
    const userId = "680910ab8cb4cb70e7c6a48d" || req.user._id
    
    try {
        const user = await User.findById(userId)
        //real id
        // const user = await User.findById(userId)

        if (description == null || description == "") return res.status(500).json({err: "The project description is required for creating a project"})

        const project = await Project.create({
            // manager: userId,
            manager: userId,
            description,
            tasks,
            specifications,
            sideNotes
        })

        user.projects.push(project._id)
        await user.save()

        res.status(200).json({msg: "Creation successful", project})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

// router.get("/read", authCheck, async (req, res) => {
router.get("/read", async (req, res) => {
    const userId  = "680910ab8cb4cb70e7c6a48d" || req.user._id

    try {
        // const user = User.findById(userId)
        const projectList = await User.findById(userId).select("projects").populate({
            path: "projects",
            populate: "tasks"
        })

        res.status(200).json({msg: "These are the user projects", projectList})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

router.get("/read/:id", async (req, res) => {
    const userId = "680910ab8cb4cb70e7c6a48d" || req.user._id

    const projectToBeFound = req.params.id
    if (!isValidObjectId(projectToBeFound)) return res.status(404).json({msg: "Project was not found, it might have been deleted"})

    try {
        const projectInfo = await User.findById(userId)
            .select("projects")
            .populate({
                "path": "projects",
                match: {_id: projectToBeFound},
                populate: {
                    path: "tasks",
                    populate: {
                        path: "subTasks"
                    }
                }
            })

        res.status(200).json(projectInfo)
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

// router.patch("/update/:id", authCheck, async (req, res) => {
router.patch("/update/:id", async (req, res) => {
    const userId = "680910ab8cb4cb70e7c6a48d" || req.user._id

    const projectToBeFound = req.params.id

    const {tasks, sideNotes, specifications,  description} = req.body

    try {
        const projectInfo = await Project.findOneAndUpdate(
            { _id: projectToBeFound, manager: userId }, 
            { description, specifications, tasks, sideNotes },
            { new: true, runValidators: true }
        )

        if (!projectInfo) {
            return res.status(404).json({ msg: "Project not found or It has already been deleted" })
        }

        res.status(200).json(projectInfo)
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

// router.delete("/delete/:id", authCheck, async (req, res) => {
router.delete("/delete/:id", async (req, res) => {
    const userId = "680910ab8cb4cb70e7c6a48d" || req.user._id

    const projectToBeFound = req.params.id

    try {
        const project = await Project.findOne({ _id: projectToBeFound, manager: userId })

        if (!project) return res.status(404).json({ msg: "Project not found, it has either been deleted already or does not exist" })

        await Task.deleteMany({ projectId: projectToBeFound })

        await SubTask.deleteMany({ taskId: { $in: project.tasks } })

        await User.findByIdAndUpdate(
            { _id: userId },
            { $pull: {projects: projectToBeFound} },
        )

        await Project.findByIdAndDelete(projectToBeFound)

        res.status(200).json(project)
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

module.exports = router