# Step-by-Step Guide: Push Code & Create PR

## Prerequisites
- You have a fork of DailyForge on your GitHub account
- Git is installed and configured with your GitHub credentials

## Step 1: Create a New Branch

```bash
cd c:\Users\pmura\OneDrive\Desktop\port\DailyForge

# Create and switch to a new branch
git checkout -b feature/forgot-password-otp
```

## Step 2: Stage All Changes

```bash
# Stage all modified and new files
git add .

# Verify changes to be committed
git status
```

You should see:
- 6 new files (OTP.js, emailService.js, otpUtils.js, 3 frontend pages)
- 9 modified files (controllers, routes, App.jsx, Login.jsx, etc.)

## Step 3: Commit Changes

```bash
git commit -m "Added OTP-based forgot password feature

- Implemented secure password reset workflow with email verification
- Added 3 new API endpoints (/forgot-password, /verify-otp, /reset-password)
- Created OTP model with 10-minute TTL and auto-cleanup
- Integrated Gmail SMTP for OTP delivery via Nodemailer
- Added 3 new frontend pages (ForgotPassword, VerifyOTP, ResetPassword)
- Updated login page with 'Forgot Password?' link
- Enhanced CORS configuration for multiple origins
- Added comprehensive error handling and validation
- Full feature tested and working

Files Changed:
- backend/src/models/OTP.js (NEW)
- backend/utils/emailService.js (NEW)
- backend/utils/otpUtils.js (NEW)
- backend/controllers/authController.js
- backend/routes/authRoutes.js
- backend/src/server.js
- backend/.env.example
- frontend/src/pages/ForgotPassword.jsx (NEW)
- frontend/src/pages/VerifyOTP.jsx (NEW)
- frontend/src/pages/ResetPassword.jsx (NEW)
- frontend/src/App.jsx
- frontend/src/pages/Login.jsx

Closes #473"
```

## Step 4: Push to Your Fork

```bash
# Push the branch to your fork
git push origin feature/forgot-password-otp
```

## Step 5: Create Pull Request on GitHub

1. Go to: https://github.com/murali-krishna-palla/DailyForge
2. You'll see a notification: "Compare & pull request"
3. Click it, or go to "Pull requests" tab and click "New pull request"

### Fill in PR Details:

**Title:**
```
Added Forgot Password Functionality with OTP Verification
```

**Description:**
Copy and paste from the PR_DESCRIPTION.md file in this repo.

**Alternative: Use GitHub CLI**

If you have GitHub CLI installed:

```bash
# Create PR directly from command line
gh pr create --title "Added Forget Password Functionality with OTP Verification" --body-file PR_DESCRIPTION.md --head feature/forgot-password-otp --base main
```

## Step 6: Add Reviewers/Labels (Optional)

- Add reviewers if you're collaborating
- Add labels like:
  - `feature`
  - `authentication`
  - `enhancement`

## Step 7: Wait for CI/CD & Review

- GitHub Actions will run any configured tests
- Make sure all checks pass ✅
- Address any feedback from reviewers

## Troubleshooting

### If push fails:
```bash
# Ensure your fork is up to date
git fetch origin
git rebase origin/main
git push -u origin feature/forgot-password-otp
```

### If commit fails:
```bash
# Check git configuration
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Then try commit again
git commit -m "message"
```

### To view commit history before pushing:
```bash
git log --oneline -5
```

## After PR is Merged

```bash
# Switch back to main branch
git checkout main

# Pull the latest changes
git pull origin main

# Delete local feature branch
git branch -d feature/forgot-password-otp

# Delete remote feature branch
git push origin --delete feature/forgot-password-otp
```

## Summary of Changes

### Backend Changes:
- **New files**: OTP model, email service, OTP utilities
- **Modified files**: authController (3 new functions), authRoutes (3 new endpoints), server.js (CORS)
- **New dependencies**: nodemailer

### Frontend Changes:
- **New pages**: ForgotPassword, VerifyOTP, ResetPassword
- **Modified files**: App.jsx (routes), Login.jsx (forgot password link)
- **UI consistency**: All pages follow existing DailyForge design patterns

### Key Features:
✅ 6-digit OTP with 10-minute expiry
✅ Email verification via Gmail SMTP
✅ Strong password validation
✅ Secure token-based reset flow
✅ Full error handling
✅ CORS configured for development & production

---

**Ready to push!** Run the commands above in order to create your PR. 🚀
