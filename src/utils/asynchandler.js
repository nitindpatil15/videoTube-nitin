const asynchandler = (fn)=async (req,res,next)=>{
    try {
    await fn(req,res,next)
    
} catch (err) {
    res.status(err.code || 404).json({
        success : false , 
        message : err.message
    })
}}