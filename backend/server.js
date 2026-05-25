import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import createApp from "./src/app.js";
import connectDB from "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const app = createApp({ clientOrigin: process.env.CLIENT_ORIGIN });

    app.listen(PORT, () => {
      console.log(`Server running at port ${PORT}\nhttp://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
};

startServer();
