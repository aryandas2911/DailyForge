// Define an array of required environment variables
const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "FRONTEND_URL"
];

export const validateEnv = () => {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`FATAL ERROR: Missing required environment variable: ${envVar}. Server shutting down...`);
      process.exit(1);
    }
  }
  console.log("Environment variables validated successfully.");
};
