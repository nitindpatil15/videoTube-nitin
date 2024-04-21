import { ApiError } from "../utils/ApiError";
import { asynchandler } from "../utils/asynchandler";
import jwt from  'jsonwebtoken';
import User from "../models/User.model";

const verifyJWT = asynchandler(async (req ,res,next)=>{
    try {
        const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
    
        if(!Token){
            throw new ApiError(401,"UnAuthorized request")
        }
    
        const decodedJWT = jwt.verify(Token,process.env.API_SECRETE)
        const user = User.findById(decodedJWT._id).select(
            "-password -refreshToken"
        )  // refrence of _id is from user controller
    
        if(!user){
            throw new ApiError(401,"Invalid token")
        }
    
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access Token")
    }
})

export default  verifyJWT;