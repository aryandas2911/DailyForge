// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };

// const app = initializeApp(firebaseConfig);

// const auth = getAuth(app);

// const googleProvider = new GoogleAuthProvider();

// googleProvider.addScope("profile");
// googleProvider.addScope("email");

// googleProvider.setCustomParameters({
//   prompt: "select_account",
// });

// export { auth, googleProvider };
// export default app;
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

// Detect placeholder/missing config so local dev without Firebase doesn't crash the whole app.
const isFirebaseConfigured =
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("your_");

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  googleProvider.addScope("profile");
  googleProvider.addScope("email");

  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
} else {
  console.warn(
    "Firebase is not configured (placeholder values detected in .env). Google Sign-In will be disabled."
  );
}

export { auth, googleProvider };
export default app;