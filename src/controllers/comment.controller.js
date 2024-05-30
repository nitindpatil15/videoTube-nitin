import mongoose from "mongoose"
import {Video} from "../models/Video.model.js"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponce } from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asynchandler.js"

const getVideoComments = asynchandler(async (req, res) => {
    const {_id} = req.query  //VideoId
    const {page = 1, limit = 10} = req.query

    const isValidVideo = await Video.findById(_id)

    if(!isValidVideo){
        throw new ApiError(402,"Invalid Video")
    }

    const comments = await Comment.aggregate([
        {
            $match:{video: new mongoose.Types.ObjectId(`${_id}`)}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        }
    ])

    if(!comments){
        throw new ApiError(402,"No Comments")
    }

    return res.status(200)
    .json(new ApiResponce(200,comments,"All Video Comments"))
})

const addComment = asynchandler(async (req, res) => {
    try {
        const {_id} = req.query
        const {content}=req.body
        const userId = req.user?._id
    
        if(!_id){
            throw new ApiError(402,"Invalid Video Id")
        }
        if(!content){
            throw new ApiError(402,"All Fields Are required")
        }
        if(!userId){
            throw new ApiError(401,"Unauthorized User")
        }
        
        const videoComment = await Comment.create({
            content,
            video: _id,
            owner:req.user?._id
        })
    
        return res
        .status(200)
        .json(new ApiResponce(200,videoComment,"Commented on Video"))
    
      } catch (error) {
       throw new ApiError(500,"Server Error")
      }
})

const updateComment = asynchandler(async (req, res) => {
    try {
        const {_id} = req.query //CommentId = _id
        const {content} = req.body
        
        const UpdateComment = await Comment.findByIdAndUpdate(_id,
            {
                $set: {
                    content: req.body.content
                }
            },
            {
                new: true,
            }
        )
    
        if(!UpdateComment){
            throw new ApiError(404,"Try Again")
        }
    
        return res.status(200)
        .json(new ApiResponce(200,UpdateComment,"Comment Updated"))
    
    } catch (error) {
        throw new ApiError(402,"Network Issue")
    }})

const deleteComment = asynchandler(async (req, res) => {
   try {
     const {_id} = req.query
 
     const DeleteComment = await Comment.findByIdAndDelete(_id)
 
     if(!DeleteComment){
         throw new ApiError(401,"Something Went Wrong!")
     }
 
     return res.status(200)
     .json(new ApiResponce(200,DeleteComment,"Deleted a Comment"))
 
   } catch (error) {
    throw new ApiError(401,"Something Went Wrong,try After Sometime")
   }})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }