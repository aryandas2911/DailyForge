import nodemailer from "nodemailer"



console.log({ EMAIL_USER: process.env.EMAIL_USER, EMAIL_PASSWORD: process.env.EMAIL_PASSWORD, });





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

