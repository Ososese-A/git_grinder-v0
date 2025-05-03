const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },

    description: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    specifications: {
        type: [mongoose.Schema.Types.String]
    },

    sideNotes: {
        type: [mongoose.Schema.Types.String],
    },

    tasks: [{
        type: mongoose.Schema.Types.String,
        ref: "Task"
    }]
}, {timestamps: true})

module.exports = mongoose.model("Project", projectSchema)