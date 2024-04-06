import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.Api_SECRETE 
});


const uploadOnCloudinary = async (localfilepath)=>{
    try {
        if(!localfilepath) return null
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        // File has been Uploaded Successfully 
        console.log("File Uploded Successfully",response.url);
        return response
    } catch (error) {
        fs.unlink(localfilepath) //Remove the Locally saved temporary file uplod operationn got failed 
        return null
    }
}