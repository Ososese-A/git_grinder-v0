const mongoose = require("mongoose")

const grinderGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    goalType: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    goalDescription: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    dailyCommitTarget: {
        type: mongoose.Schema.Types.Number,
        required: true
    },

    weeklyCommitTarget: {
        type: mongoose.Schema.Types.Number,
        required: true
    },

    monthlyCommitTarget: {
        type: mongoose.Schema.Types.Number,
        required: true
    },

    yearlyCommitTarget: {
        type: mongoose.Schema.Types.Number,
        required: true
    }
}, {timestamps: true})


const savedProjectsSchema = new mongoose.Schema({
    difficulty: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    description: {
        type: mongoose.Schema.Types.String,
        required: true
    }
}, {timestamps: true})


const userSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.String,
        required: true
    }, 

    
    email: {
        type: mongoose.Schema.Types.String,
        required: true
    }, 

    gitID: {
        type: mongoose.Schema.Types.String,
        required: true
    }, 

    profileUrl: {
        type: mongoose.Schema.Types.String,
        required: true
    }, 

    profilePhoto: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    projects: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Project"
    },

    ongoingProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },

    savedProjects: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "SavedProjects"
    },

    grinderGoal: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "GrinderGoal"
    }
    
}, {timestamps: true})

module.exports = {
    User: mongoose.model("User", userSchema),
    SavedProjects: mongoose.model("SavedProjects", savedProjectsSchema),
    GrinderGoal: mongoose.model("GrinderGoal", grinderGoalSchema)
}