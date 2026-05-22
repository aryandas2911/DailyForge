// Derive tags from categories so tags match the category filter
// Predefined tags available in the task creation UI — limit to the four allowed filter tags
export const TAGS = ["Homework", "Routine", "Creative", "Other"];

/**
 * Check whether a tag is one of the predefined tags
 * (excluding the special "Other" which only triggers the custom input)
 */
export const isPredefinedTag = (tag) => TAGS.includes(tag);