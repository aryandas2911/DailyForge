const USERNAME_REGEX = /^[a-z][a-z0-9_-]{1,29}$/;

export function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export function validateUsername(username) {
  const normalized = normalizeUsername(username);

  if (!normalized) {
    return "Username is required";
  }

  if (/^\d+$/.test(normalized)) {
    return "Username cannot be numbers only";
  }

  if (!USERNAME_REGEX.test(normalized)) {
    return "Username must be 2–30 characters, start with a letter, and use only letters, numbers, underscores, or hyphens";
  }

  return null;
}
