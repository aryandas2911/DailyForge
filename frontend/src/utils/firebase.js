import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let auth = null;
let googleProvider = null;

// Only initialize Firebase if an API key is provided
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_firebase_api_key") {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Auth and Google Provider
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  // Request profile and email scopes (standard for Google Sign-In)
  googleProvider.addScope("profile");
  googleProvider.addScope("email");

  // Force account selection screen
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
}

export { auth, googleProvider };
export default app;
