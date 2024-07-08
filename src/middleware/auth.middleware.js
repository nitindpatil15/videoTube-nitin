import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from  'jsonwebtoken';
import user from "../models/User.model.js";
import {ACCESS_TOKEN_SECRET} from '../constants.js'

const verifyJWT = asynchandler(async (req ,_,next)=>{
    try {
        const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
        console.log(req.cookies?.accessToken)
        if(!Token){
            throw new ApiError(401,"UnAuthorized request")
        }
    
        const decodedJWT = jwt.verify(Token,ACCESS_TOKEN_SECRET)
        const User = await user.findById(decodedJWT?._id).select(
            "-password -refreshToken"
        )  // refrence of _id is from user controller
    
        if(!User){
            throw new ApiError(401,"Invalid token")
        }
    
        req.user=User;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access Token")
    }
})

export default  verifyJWT;