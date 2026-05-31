import nodemailer from "nodemailer"
import dotenv from "dotenv"


dotenv.config();



const transporter = nodemailer.createTransport({
    service : "gmail",
    
        auth : {
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASSWORD
        },
        tls : {
            rejectUnauthorized : false
        }
        
})









export default transporter;

