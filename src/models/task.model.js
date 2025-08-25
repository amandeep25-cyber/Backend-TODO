import mongoose from "mongoose"

const taskSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        isCompleted: {
            type: Boolean,
            required: true,
            default: false
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { 
        timestamps: true
    }
)

export const Task = mongoose.model("Task", taskSchema)