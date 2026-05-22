import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

let app = null;
let auth = null;
let googleProvider = null;

if (apiKey && apiKey !== "your_firebase_api_key") {
  const firebaseConfig = {
    apiKey,
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
    
    // Request profile and email scopes (standard for Google Sign-In)
    googleProvider.addScope("profile");
    googleProvider.addScope("email");
    
    // Force account selection screen
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase API key is not configured. Google Sign-In will not be available.");
}

export { auth, googleProvider };
export default app;

