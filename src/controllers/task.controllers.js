import { Task } from "../models/task.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose"

const createTask = asyncHandler(async(req, res)=>{
    const { title, description } = req.body;
    const userId = req.user;

    const createdTask = await Task.create({
        title,
        description,
        author: userId
    })

    if(!createdTask){
        throw new ApiError(400,"Something is wrong in creating task")
    }

    const task = await Task.findById(createdTask._id).populate('author',"fullName")

    if(!task){
        throw new ApiError(400,"Task did not create in database")
    }

    res.json(
        new ApiResponse(201,task,"Task created successfully")
    )
})

const getAllTask = asyncHandler(async (req, res)=>{

    const userId = req.user._id;
    
    const task = await User.aggregate([
        {
            $match:{ _id: userId}
        },
        {
            $lookup:{
                from: "tasks",
                localField: "_id",
                foreignField: "author",
                as:"allTask"
            }
        },
        {
            $project:{
                fullName:1,
                allTask:1
            }
        }
        
    ])

    res.json(
        new ApiResponse(200,task,"All data fetched Successfully")
    )

})

const deleteOneTask = asyncHandler( async(req,res)=>{
    const documentId = req.params.id;

    const task = await Task.deleteOne({_id: documentId})
    
    if(!task.deletedCount){
        throw new ApiError(400,"Invalid Id and give a valid id")
    }

    res.json(
        new ApiResponse(200,{deletedTask: task},"Task deleted successfully")
    )

})

const updateInTask = asyncHandler( async(req, res)=>{
    let updatingTask = req.body;
    const updatingTaskId = req.params.id;
    
    let task = await Task.findByIdAndUpdate({ _id: updatingTaskId},
        updatingTask,{
            new: true,
            runValidators: true
        }
    )

    console.log(task)

    if(!task){
        throw new ApiError(400,"Give a valid Id")
    }

    res.json(
        new ApiResponse(200,{ task },"Task Updated Successfully")
    )

})

const istaskCompleted = asyncHandler( async( req,res)=>{

    if(!((req.query.status)=='true' || (req.query.status)=='false')){
        throw new ApiError(400,"Send the Exact status of the Task")
    }

    const status = req.query.status
    
    const _id = req.params.id

    const updatedTaskStatus = await Task.findByIdAndUpdate({_id},{isCompleted: status},{
        new: true,
        runValidators: true
    })

    if(!updatedTaskStatus){
        throw new ApiError(404,"Task not found")
    }

    res.json(
        new ApiResponse(200,{updatedTaskStatus},"Task updated successfully")
    )
})

const getCompletedTask = asyncHandler( async (req,res)=>{
    
    const allCompletedTask = await Task.find({
        $and: [{author: req.user._id},{isCompleted: true}]
    })


    res.json(
        new ApiResponse(200,{allCompletedTask},"All Completed Task fetched successfully")
    )
})

const getIncompletedTask = asyncHandler( async (req,res)=>{
    
    const allIncompletedTask = await Task.find({
        $and: [{author: req.user._id},{isCompleted: false}]
    })


    res.json(
        new ApiResponse(200,{allIncompletedTask},"All Incompleted Task fetched successfully")
    )
})


export { 
    createTask,
    getAllTask,
    deleteOneTask,
    updateInTask,
    istaskCompleted,
    getCompletedTask,
    getIncompletedTask

 }