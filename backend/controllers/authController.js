import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import OtpModel from "../models/auth.js"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verifyFirebaseIdToken } from '../utils/firebaseAuth.js';
import crypto from 'crypto';
import otpModel from '../models/auth.js';
import transporter from "../config/mail.js"




// ─── Encryption helpers for twoFactorSecret ───────────────────────────────────
const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY; // 64-char hex (32 bytes)

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const [iv, encrypted] = text.split(':').map((p) => Buffer.from(p, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();
}
// ──────────────────────────────────────────────────────────────────────────────

const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';
const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

const getJwtSecret = (res) => {
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: 'Authentication service is misconfigured' });
    return null;
  }
  return process.env.JWT_SECRET;
};

const isProduction = process.env.NODE_ENV === 'production';
const getAuthCookieOptions = () => {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  };
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN || process.env.COOKIE_DOMAIN;
  if (cookieDomain) cookieOptions.domain = cookieDomain;
  return cookieOptions;
};

// ─── Sign up ──────────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character',
      });
    }

    const checkExisting = await User.findOne({ email });
    if (checkExisting) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: JWT_ALGORITHM,
    });

    return res
      .status(201)
      .cookie('token', token, getAuthCookieOptions())
      .json({
        message: 'User registered successfully',
        user: { _id: newUser._id, name: newUser.name, email: newUser.email },
      });
  } catch (_error) {
    console.error('Signup error:', _error);
    return res.status(500).json({ message: 'Server error during signup' });
  }
};

// ─── Login (handles 2FA check) ────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Do NOT reveal whether the user exists
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If 2FA is enabled, ask client to submit TOTP before issuing JWT
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        requires2FA: true,
        tempUserId: user._id,
      });
    }
    // If 2FA enabled, don't issue token yet
    if (user.twoFactorEnabled) {
      return res.status(200).json({ requires2FA: true, tempUserId: user._id });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return res
      .status(200)
      .cookie('token', token, getAuthCookieOptions())
      .json({
        message: 'Login successful',
        user: { _id: user._id, name: user.name, email: user.email },
      });
  } catch (_error) {
    console.log('Login error: ', _error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// ─── Complete login with TOTP code ────────────────────────────────────────────
export const loginWith2FA = async (req, res) => {
  try {
    const { tempUserId, token } = req.body;

    // Validate TOTP format first — must be exactly 6 digits
    if (!token || !/^\d{6}$/.test(token)) {
      return res.status(400).json({ message: 'Invalid code format' });
    }

    const user = await User.findById(tempUserId);
    // Use same message for missing user and wrong code — don't leak user presence
    if (!user || !user.twoFactorSecret) {
      return res.status(401).json({ message: 'Invalid credentials or code' });
    }

    const verified = speakeasy.totp.verify({
      secret: decrypt(user.twoFactorSecret), // decrypt before verifying
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid credentials or code' });
    }

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const jwtToken = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: JWT_ALGORITHM,
    });

    return res
      .status(200)
      .cookie('token', jwtToken, getAuthCookieOptions())
      .json({
        message: 'Login successful',
        user: { _id: user._id, name: user.name, email: user.email },
      });
  } catch (_error) {
    return res.status(500).json({ message: 'Server error during 2FA login' });
  }
};

// ─── Generate secret and QR code ─────────────────────────────────────────────
export const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({ name: `DailyForge (${user.email})` });

    // Encrypt the temp secret before storing in DB
    await User.findByIdAndUpdate(req.userId, {
      twoFactorTempSecret: encrypt(secret.base32),
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return res.status(200).json({ qrCodeUrl, secret: secret.base32 });
  } catch (_error) {
    return res.status(500).json({ message: 'Error setting up 2FA' });
  }
};

// ─── Verify TOTP and enable 2FA ───────────────────────────────────────────────
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    // Validate TOTP format — must be exactly 6 digits
    if (!token || !/^\d{6}$/.test(token)) {
      return res.status(400).json({ message: 'Invalid code format' });
    }

    const user = await User.findById(req.userId);
    if (!user || !user.twoFactorTempSecret) {
      return res.status(400).json({ message: 'Invalid credentials or code' });
    }

    const verified = speakeasy.totp.verify({
      secret: decrypt(user.twoFactorTempSecret), // decrypt before verifying
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid credentials or code' });
    }

    // Generate backup codes — show plain text once, store hashed
    const plainCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(5).toString('hex').toUpperCase()
    );
    const hashedCodes = await Promise.all(plainCodes.map((c) => bcrypt.hash(c, 10)));

    await User.findByIdAndUpdate(req.userId, {
      twoFactorSecret: user.twoFactorTempSecret, // already encrypted, move to permanent field
      twoFactorEnabled: true,
      twoFactorTempSecret: null,
      backupCodes: hashedCodes,
    });

    return res.status(200).json({
      message: '2FA enabled successfully',
      backupCodes: plainCodes, // shown to user ONE TIME only — they must save these
    });
  } catch (_error) {
    return res.status(500).json({ message: 'Error verifying 2FA' });
  }
};

// ─── Disable 2FA (requires TOTP confirmation) ─────────────────────────────────
export const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;

    // Validate TOTP format — must be exactly 6 digits
    if (!token || !/^\d{6}$/.test(token)) {
      return res.status(400).json({ message: 'Invalid or missing TOTP code' });
    }

    const user = await User.findById(req.userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(401).json({ message: 'Invalid credentials or code' });
    }

    const verified = speakeasy.totp.verify({
      secret: decrypt(user.twoFactorSecret), // decrypt before verifying
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid credentials or code' });
    }

    await User.findByIdAndUpdate(req.userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
    });

    return res.status(200).json({ message: '2FA disabled' });
  } catch (_error) {
    return res.status(500).json({ message: 'Error disabling 2FA' });
  }
};

// ─── Get user ─────────────────────────────────────────────────────────────────
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (_error) {
    return res.status(500).json({ message: 'Error fetching user data', success: false });
  }
};

// ─── Update profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;

    if (currentPassword && newPassword) {
      const passwordCheck = await bcrypt.compare(currentPassword, user.password);
      if (!passwordCheck) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (_error) {
    console.log('Profile update error:', _error);
    return res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
};




// logout function
export const logout = (req, res) => {
  res.clearCookie('token', getAuthCookieOptions());
  return res.status(200).json({ message: 'Logout successful' });
};

// ─── Google Login ─────────────────────────────────────────────────────────────
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID Token is required' });
    }

    let decodedToken;
    try {
      decodedToken = await verifyFirebaseIdToken(idToken);
    } catch (verifyError) {
      return res.status(401).json({
        message: 'Invalid or expired Firebase token',
        error: verifyError.message,
      });
    }

    const { email, name } = decodedToken;
    if (!email) {
      return res.status(400).json({ message: 'Email is missing from the Google identity token' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
      });
      await user.save();
      console.log(`[GOOGLE AUTH] Created new user profile for: ${email}`);
    } else {
      console.log(`[GOOGLE AUTH] Logged in existing user: ${email}`);
    }

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: JWT_ALGORITHM,
    });

    return res
      .status(200)
      .cookie('token', token, getAuthCookieOptions())
      .json({
        message: 'Google sign-in successful',
        user: { _id: user._id, name: user.name, email: user.email },
      });
  } catch (_error) {
    console.error('[GOOGLE AUTH] Controller error:', _error);
    return res.status(500).json({ message: 'Server error during Google authentication' });
  }
};









export const forgot = async (req, res) => {
  const { email } = req.body;



  

  try {
    if (!email) {
      return res.status(400).json({
        message: "Email cannot be empty",
        success: false,
      });
    }

    const isExist = await User.findOne({email});

    if (isExist) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));

      const hashedotp = await bcrypt.hash(otp, 10);

     await otpModel.findOneAndDelete({email});


      await otpModel.create({
        email,
       otp :  hashedotp
      })


    

   
      if(!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD){
        console.log("Email credentials missing");

        console.log("OTP:", otp);

      return res.status(200).json({
      message:  "OTP generated locally",
         success: true,
      });


      }


      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "OTP for password reset",
        text: `We received a request to reset your password. Your OTP is ${otp}. This OTP is valid for 5 minutes. If you did not request this, please ignore this email.`,
      });
    }



    return res.status(200).json({
      message: "If the account exists, an OTP has been sent.",
      success: true,
    });
  } catch (err) {
    console.log(err, "Error hai");

    return res.status(500).json({
      message: "Something went wrong",
      success: false,
      error : err
    });
  }
};



export const verifyOtp = async (req, res) => {
  const { otp, email } = req.body;

  try {
    if (!otp || !email) {
      return res.status(400).json({
        message: "Otp and email both are required",
        success: false,
      });
    }


        if(otp.length>6 || otp.length<6){
      return res.status(400).json({
        message : "Otp length should be equal to 6",
        success : falseUnAuthorized 
      })
    }


    const otprecord = await OtpModel.findOne({email})

    if (!otprecord) {
      return res.status(400).json({
        message: "Invalid Otp request",
        success: false,
      });
    }

    const otpCreatedTime = new Date(otprecord.createdAt).getTime();

    if (otpCreatedTime + 5 * 60 * 1000 < Date.now()) {
      return res.status(400).json({
        message: "Otp has been expired",
        success: false,
      });
    }

    const isOtpVerified = await bcrypt.compare(otp, otprecord.otp);

    if (!isOtpVerified)
      return res.status(401).json({
        message: "Otp is invalid",
        success: false,
      });

    await OtpModel.findOneAndDelete({email});

  const resetToken = jwt.sign(
    {email : email},
    process.env.JWT_RESET_PASSWORD,
    {expiresIn : "5m"}

  )      



  res.cookie("resetToken",resetToken,{
    httpOnly : true,
    secure : false,
    sameSite : "strict",
    maxAge : 5 * 60 * 1000
  })


    return res.status(200).json({
      message: "Otp verified successfully",
      success: true,
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};



export const setNewPassword = async (req,res)=>{

  const { password } = req.body;
  const resetToken = req?.cookies?.resetToken;

  try{
  if(!password){
    return res.status(400).json({
      message : "Password is required",
      success : false
    })
   
  }

  if(!resetToken){
    return res.status(401).json({
      message : "UnAuthorized Access",
      success : false
    })

  }



  const verified = jwt.verify(resetToken,process.env.JWT_RESET_PASSWORD);




  const user = await User.findOne({email : verified.email})

   if(!user){
    return res.status(400).json({
      message : "User not found",
      success : false
    })
  }


  const compareOldNew = await bcrypt.compare(password,user.password);

 


  if(compareOldNew){
    return res.status(400).json({
      message : "New Password cannot be same as Old Password",
      success : false
    })
  }


  const hashedpassword = await bcrypt.hash(password,10);


  await User.findOneAndUpdate({email : verified.email},{ password : hashedpassword})


  res.clearCookie("resetToken");


  return res.status(200).json({
    message : "Password reset Successfully",
    success : true
  })

  
}catch(err){


  return res.status(500).json({
    message : "Something went wrong",
    success : false
  })
}
}




