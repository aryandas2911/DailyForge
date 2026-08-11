// Define an array of required environment variables
const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
  "TWO_FACTOR_ENCRYPTION_KEY"
];

export const validateEnv = () => {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`FATAL ERROR: Missing required environment variable: ${envVar}. Server shutting down...`);
      process.exit(1);
    }
  }

  const twoFactorKey = process.env.TWO_FACTOR_ENCRYPTION_KEY;
  if (Buffer.from(twoFactorKey, "hex").length !== 32) {
    console.error(
      "FATAL ERROR: TWO_FACTOR_ENCRYPTION_KEY must be a 32-byte hex key (64 hex characters).\n" +
      "Generate one with: node -e \"console.log(crypto.randomBytes(32).toString('hex'))\""
    );
    process.exit(1);
  }

  console.log("Environment variables validated successfully.");
};

