const asyncHandler=(fn)=>{
    return (req,res,next)=>{
        Promise.resolve(fn(req,res,next))
        .catch((err)=>next(err));
    }
}

export {asyncHandler};