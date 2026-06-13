import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

let app = null;
let auth = null;
let googleProvider = null;

if (apiKey && apiKey !== "your_firebase_api_key") {
  const firebaseConfig = {
    apiKey: apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope("profile");
    googleProvider.addScope("email");
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  console.warn("Firebase API Key is missing or default. Google Sign-In will be disabled.");
}

export { auth, googleProvider };
export default app;
