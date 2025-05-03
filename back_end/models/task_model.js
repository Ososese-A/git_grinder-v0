const mongoose = require("mongoose")

const subTaskModel = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Task"
    },

    number: {
        type: mongoose.Schema.Types.Number,
        required: true
    },

    description: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    timeline: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    changes: {
        type: mongoose.Schema.Types.Array
    }
}, {timestamps: true})


const taskModel = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Project"
    },

    number: {
        type: mongoose.Schema.Types.Number,
        required: true
    },

    description: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    subTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask"
    }],

    // changes: {
    //     description: taskChanges.description,
    //     files: taskChanges.files,
    //     systemUpdatedAt: taskChanges.updatedAt,
    //     updatedAt: new Date()
    // }
    //this is how this would be saved

    changes: {
        type: mongoose.Schema.Types.Array
    }
}, {timestamps: true})

module.exports = { 
    Task: mongoose.model("Task", taskModel),
    SubTask: mongoose.model("SubTask", subTaskModel)
 }