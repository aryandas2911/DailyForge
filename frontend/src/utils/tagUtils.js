// Predefined tags available in the task creation UI
export const TAGS = ["Homework", "Routine", "Creative", "Other"];

/**
 * Check whether a tag is one of the predefined tags
 * (excluding the special "Other" which only triggers the custom input)
 */
export const isPredefinedTag = (tag) => TAGS.includes(tag);