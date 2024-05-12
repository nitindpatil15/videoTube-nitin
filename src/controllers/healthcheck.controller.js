import {ApiError} from "../utils/ApiError.js"
import { ApiResponce } from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"


const healthcheck = asynchandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
})

export {
    healthcheck
    }
