const express = require("express")
const router = express.Router()
const { authCheck } = require("../middleware/auth_middleware")
const Project = require("../models/project_model")
const {Task, SubTask} = require("../models/task_model")
const { isValidObjectId } = require("mongoose")

// router.post("/create", authCheck, (req, res) => {
router.post("/create/:id", async (req, res) => {
    const projectId = req.params.id

    if (!isValidObjectId(projectId)) return res.status(404).json({msg: "Task Project not found, the id is invalid"})

    const {number, description, changes, subTasks} = req.body

    if (!number || !description)  return res.status(500).json({msg: "The number and description are required"})

    try {
        const project = await Project.findById(projectId)

        if (!project) return res.status(404).json({msg: "Task Project not found"})

        const task = await Task.create({
            projectId,
            number,
            description,
            subTasks: [],
            changes
        })

        if (subTasks) {
            let subTaskIds = []

            for (subTask of subTasks) {
                const subTaskObject = await SubTask.create({
                    ...subTask,
                    taskId: task._id
                })
                subTaskIds.push(subTaskObject._id)
            }

            task.subTasks = subTaskIds
            await task.save()

            project.tasks.push(task._id)
            await project.save()
        }

        res.status(201).json({msg: "Task creation successful", })
        
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: err.message})
    }
})

// router.post("/create/:id", authCheck, async (req, res) => {
router.post("/createSubTask/:id", async (req, res) => {
    const {number, description, timeline, changes} = req.body

    if (!number || !description || !timeline) return res.status(404).status({ msg: "Number, Description and Timeline are required" })

    const taskId = req.params.id

    if (!isValidObjectId(taskId)) return res.status(404).json({ msg: "Subtask Task not found, invalid Id" })

    try {
        const task = await Task.findById(taskId)

        if (!task) return res.status(404).json({ msg: "SubTask Task not found" })

        const subTask = await SubTask.create({
            taskId,
            number,
            description,
            timeline,
            changes
        })

        task.subTasks.push(subTask._id)
        await task.save()

        res.status(201).json({ msg: "This is it", subTask })
    } catch (err){
        res.status(500).json({ error: err.message })
    }
})

// router.get("/read", authCheck, async (req, res) => {
router.get("/read/:id", async (req, res) => {
    const projectId = req.params.id

    if (!isValidObjectId(projectId)) return res.status(404).json({ msg: "Task Project not found, the id is invalid" })

    try {
        const taskList = await Project.findById(projectId).select("tasks").populate({
            path: "tasks",
            populate: { 
                path: "subTasks"
            }
        })

        if (!taskList) return res.status(404).json({ msg: "Task not found" })

        res.status(200).json({msg: "This is it", taskList})

    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: err.message})
    }
})

// router.get("/readOne/:id", authCheck, async (req, res) => {
router.get("/readOne/:id", async (req, res) => {
    const taskId = req.params.id

    if (!isValidObjectId(taskId)) return res.status(404).json({ msg: "Task not found, invalid Id" })

    try {
        const task = await Task.findById(taskId).populate( "subTasks" )

        if (!task) return res.status(404).json({ msg: "Task not found" })
        
        res.status(200).json({ msg: "This is it", task })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.get("/readSubTask/:id", authCheck, async (req, res) => {
router.get("/readSubTasks/:id", async (req, res) => {
    const taskId = req.params.id

    if (!isValidObjectId(taskId)) return res.status(404).json({ msg: "SubTask Task not found, invalid Id" })

    try {
        const subTask = await SubTask.find({ taskId })

        if (subTask.length == 0) return res.status(404).json({ msg: "SubTask not found" })

        res.status(200).json({ msg: "This is it", subTask })
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ error: err.message })
    }
})

// router.get("/readSubTask/:id", authCheck, async (req, res) => {
router.get("/readSubTask/:id", async (req, res) => {
    const subTaskId = req.params.id

    if (!isValidObjectId(subTaskId)) return res.status(404).json({ msg: "SubTask not found, Invalid Id" })

    try {
        const subTask = await SubTask.findById(subTaskId)

        if (!subTask) return res.status(404).json({ msg: "SubTask not found" })

        res.status(200).json({ msg: "This is it", subTask })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.patch("/update/:id", authCheck, async (req, res) => {
router.patch("/update/:id", async (req, res) => {
    // const {number, description, timeline, subTasks} = req.body
    const {subTasks, ...fieldsToBeUpdated} = req.body

    const taskId = req.params.id

    if (!isValidObjectId(taskId)) return res.status(404).json({ msg: "Task not found, Invalid Id" })

    try {
        if (subTasks || subTasks.length > 0) {
            let subTaskPosition = 0
            for (subTask of subTasks) {
                if (!isValidObjectId(subTask.id)) return res.status(404).json({ msg: `SubTask Id at ${subTaskPosition} is an invalid Id` })
                subTaskPosition++
            }
        }

        //first update the task 
        //a possible change would be use using $set inplace of manually selecting what should be updated
        const task = await Task.findOneAndUpdate(
            {_id: taskId},
            {
                $set: fieldsToBeUpdated
            }
        )

        if (!task) return res.status(404).json({ msg: "The task could not be updated because it could not be found" })
        
        // then update the subtask
        if (subTasks || subTasks.length > 0) {
            await Promise.all (
                subTasks.map(async subTask => {
                    console.log(subTask)
                    await SubTask.findByIdAndUpdate(
                        subTask.id, 
                        {
                            $set: subTask
                        }
                    )
                } )
            )
        }

        res.status(200).json({ msg: "Update completed successfully"})
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.patch("/updateSubTask/:id", authCheck, async (req, res) => {
router.patch("/updateSubTask/:id", async (req, res) => {
    const subTask = req.body

    const subTaskId = req.params.id

    if (!isValidObjectId(subTaskId)) return res.status(404).json({ msg: "SubTask not found, Invalid Id" })

    try {
        await SubTask.findByIdAndUpdate(
            subTaskId,
            {
                $set: subTask
            }
        )

        res.status(200).json({ msg: "SubTask updated successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.patch("/taskChanges/:id", authCheck, async (req, res) => {
router.patch("/taskChanges/:id", async (req, res) => {
    //get list of files that were changed under the specific task
    const userId = req.user._id

    const projectId = req.params.id

    const { taskChanges } = req.body

    if (!taskChanges || taskChanges.length < 1) return res.status(404).json({ msg: "Task Changes to be saved is required" })

    if (!isValidObjectId(userId)) return res.status(404).json({msg: "User not found, the id is invalid"})

    if (!isValidObjectId(projectId)) return res.status(404).json({msg: "Project not found, the id is invalid"})

    try {
        const project = await Project.findOne(
            {
                manager: userId,
                _id: projectId
            }
        )

        if (!project) return res.status(404).json({ msg: "This project either does not exist or you do not have manager access to it" })

        const task = await Task.findOneAndUpdate(
            { projectId },
            {
                $push: {
                    changes: {
                        description: taskChanges.description,
                        files: taskChanges.files,
                        systemUpdatedAt: taskChanges.updatedAt,
                        updatedAt: new Date()
                    }
                }
            }
        )

        res.status(200).json({ msg: "Changes saved successfully", task })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.patch("/subTaskChanges/:id", authCheck, async (req, res) => {
router.patch("/subTaskChanges/:id", async (req, res) => {
    const userId = req.user._id

    const projectId = req.params.id

    const { subTaskChanges } = req.body

    if (!subTaskChanges || subTaskChanges.length < 1) return res.status(404).json({ msg: "Project suggestion to be saved is required" })

    if (!isValidObjectId(userId)) return res.status(404).json({msg: "User not found, the id is invalid"})

    if (!isValidObjectId(projectId)) return res.status(404).json({msg: "Task not found, the id is invalid"})
        
    try {
        const subtask = await SubTask.findOneAndUpdate(
            { taskId: {
                $in: (await Task.find({projectId, manager: userId})).map( task => task._id)
            }},
            {
                $push: {
                    changes: {
                        description: subTaskChanges.description,
                        files: subTaskChanges.files,
                        systemUpdatedAt: subTaskChanges.updatedAt,
                        updatedAt: new Date()
                    }
                }
            }
        )
        res.status(200).json({ msg: "Changes saved successfully",  subtask})
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// router.delete("/delete/:id", authCheck, async (req, res) => {
router.delete("/delete/:id", async (req, res) => {
    const taskId = req.params.id

    if (!isValidObjectId(taskId)) return res.status(404).json({ msg: "Task not found, Invalid Id" })

    try {
        const task = await Task.findById(taskId)

        if (!task) return res.status(404).json({ msg: "Task not found" })

        //remove from projects 
        await Project.findByIdAndUpdate(
            task.projectId,
            {
                $pull: {
                    tasks: taskId
                }
            }
        )

        //delete subtasks
        await SubTask.deleteMany({ taskId })

        //delete tasks
        await Task.findByIdAndDelete(taskId)

        res.status(200).json({ msg: "Task and subtasks deleted successfully" })
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ error: err.message })
    }
})

// router.delete("/deleteSubTask/:id", authCheck, async (req, res) => {
router.delete("/deleteSubTask/:id", async (req, res) => {
    const subTaskId = req.params.id

    if (!isValidObjectId(subTaskId)) return res.status(404).json({ msg: "Task not found, Invalid Id" })

    try {
        await SubTask.findByIdAndDelete(subTaskId)

        res.status(200).json({ msg: "SubTask deleted Successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router