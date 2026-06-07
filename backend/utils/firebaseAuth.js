import jwt from "jsonwebtoken";

// Cache for Google's public keys to avoid fetching them on every request
let publicKeysCache = {
  keys: null,
  expiresAt: 0,
};

/**
 * Fetch Google's public certificates for Firebase ID tokens (RS256 keys)
 * @returns {Promise<object>} Map of key IDs to certificate strings
 */
async function fetchGooglePublicKeys() {
  const now = Date.now();
  if (publicKeysCache.keys && publicKeysCache.expiresAt > now) {
    return publicKeysCache.keys;
  }

  try {
    const url = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google public keys: ${response.statusText}`);
    }

    const keys = await response.json();
    
    // Parse Cache-Control header to determine expiration (standard HTTP cache validation)
    const cacheControl = response.headers.get("cache-control");
    let maxAge = 3600 * 1000; // Default cache 1 hour
    if (cacheControl) {
      const match = cacheControl.match(/max-age=(\d+)/);
      if (match) {
        maxAge = parseInt(match[1], 10) * 1000;
      }
    }

    publicKeysCache = {
      keys,
      expiresAt: now + maxAge,
    };

    return keys;
  } catch (error) {
    console.error("[FIREBASE AUTH] Error fetching Google public keys:", error);
    // Fall back to stale cache on network failure if available
    if (publicKeysCache.keys) {
      console.warn("[FIREBASE AUTH] Using expired public keys cache as fallback");
      return publicKeysCache.keys;
    }
    throw error;
  }
}

/**
 * Verify a Firebase ID Token using Google's public certificates (RS256 signature check)
 * @param {string} token - The Firebase ID Token
 * @returns {Promise<object>} The verified token payload containing email, name, picture, etc.
 */
export async function verifyFirebaseIdToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Firebase ID token must be a non-empty string");
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const allowUnverified =
    process.env.FIREBASE_AUTH_ALLOW_UNVERIFIED === "true" &&
    process.env.NODE_ENV !== "production";

  // Fail closed by default. Allow an explicit insecure dev-mode override only when opted in.
  if (!projectId) {
    if (!allowUnverified) {
      throw new Error(
        "FIREBASE_PROJECT_ID is not configured. Refusing to accept unverified Firebase ID tokens."
      );
    }

    console.warn(
      "[FIREBASE AUTH] Insecure dev-mode enabled: accepting UNVERIFIED Firebase ID tokens " +
        "(set FIREBASE_AUTH_ALLOW_UNVERIFIED=false in production)."
    );

    const decoded = jwt.decode(token);
    if (!decoded) throw new Error("Invalid Firebase ID token format");

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      throw new Error("Firebase ID token has expired");
    }

    return decoded;
  }

  try {
    // 1. Decode token to retrieve JWT header containing 'kid' (Key ID)
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken || !decodedToken.header || !decodedToken.payload) {
      throw new Error("Invalid token format");
    }

    const { kid } = decodedToken.header;
    if (!kid) {
      throw new Error("Token header is missing 'kid' field");
    }

    // 2. Retrieve active public certificates from Google
    const publicKeys = await fetchGooglePublicKeys();
    const certificate = publicKeys[kid];
    if (!certificate) {
      throw new Error(`Public key certificate not found for key ID: ${kid}`);
    }

    // 3. Verify RS256 signature and check standard claims
    const verified = jwt.verify(token, certificate, { algorithms: ["RS256"] });

    // 4. Validate claims matching Firebase specifications
    if (verified.iss !== `https://securetoken.google.com/${projectId}`) {
      throw new Error(`Invalid token issuer: ${verified.iss}`);
    }
    if (verified.aud !== projectId) {
      throw new Error(`Invalid token audience (project ID): ${verified.aud}`);
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (verified.exp && verified.exp < now) {
      throw new Error("Firebase ID token has expired");
    }

    return verified;
  } catch (error) {
    console.error("[FIREBASE AUTH] Token verification failed:", error.message);

    // Optional insecure dev fallback (explicit opt-in only)
    if (allowUnverified) {
      console.warn(
        "[FIREBASE AUTH] Insecure dev-mode enabled: returning decoded token without signature verification."
      );
      const decoded = jwt.decode(token);
      if (decoded) return decoded;
    }
    throw error;
  }
}
