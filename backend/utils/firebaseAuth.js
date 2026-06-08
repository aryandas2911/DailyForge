import admin from "./firebaseAdmin.js";

export async function verifyFirebaseIdToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(error.message);
  }
}