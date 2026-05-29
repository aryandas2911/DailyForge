
import mongoose from "mongoose";


const otpSchema =  mongoose.Schema({
    otp : {type : String,required : true},
    email : {type : String,required : true}

    
},{timestamps  : true}
)


const otpModel = mongoose.model("otp",otpSchema);

export default otpModel;

