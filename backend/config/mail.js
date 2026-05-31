import nodemailer from "nodemailer"
import dotenv from "dotenv"


dotenv.config();




console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);

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

