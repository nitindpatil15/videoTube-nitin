import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from 'jsonwebtoken';
import User from "../models/User.model.js";
// import { ACCESS_TOKEN_SECRET } from '../constants.js';

const verifyJWT = asynchandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
        console.log("Token from middelware to check ",token)
        if(!token){
            throw new ApiError(401,"UnAuthorized request")
        }

        const decodedJWT = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(`Decoded JWT: ${decodedJWT}`);

        if (!decodedJWT) {
            throw new ApiError(401, "Unauthorized request from middleware");
        }

        const user = await User.findById(decodedJWT?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid token");
        }

        req.user = user;
        console.log(`User Authenticated: ${user}`);
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export default verifyJWT;
