import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import {CLOUDINARY_NAME,
    API_KEY,
    API_SECRETE}
    from '../constants.js'

          
cloudinary.config({ 
  cloud_name: CLOUDINARY_NAME, 
  api_key: API_KEY, 
  api_secret: API_SECRETE 
});


const uploadOnCloudinary = async (localfilepath)=>{
    try {
        if(!localfilepath) return null
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        // File has been Uploaded Successfully 
        fs.unlinkSync(localfilepath);//deleting the local file after it is uploaded to Cloudinary Server
         return response
    } catch (error) {
        fs.unlinkSync(localfilepath) //Remove the Locally saved temporary file uplod operationn got failed 
        return null
    }
}


export {uploadOnCloudinary}