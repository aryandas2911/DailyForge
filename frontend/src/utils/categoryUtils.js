// Category definitions with colors
export const CATEGORIES = [
  { name: 'Work', color: '#3b82f6', bgColor: '#dbeafe' },      // Blue
  { name: 'Personal', color: '#8b5cf6', bgColor: '#ede9fe' },  // Purple
  { name: 'Health', color: '#10b981', bgColor: '#d1fae5' },    // Green
  { name: 'Learning', color: '#f59e0b', bgColor: '#fef3c7' },  // Amber
  { name: 'Finance', color: '#ef4444', bgColor: '#fee2e2' },   // Red
  { name: 'Shopping', color: '#ec4899', bgColor: '#fce7f3' },  // Pink
  { name: 'Other', color: '#6b7280', bgColor: '#f3f4f6' },     // Gray
];

// Get category color by name
export const getCategoryColor = (categoryName) => {
  const category = CATEGORIES.find(cat => cat.name === categoryName);
  return category || CATEGORIES[CATEGORIES.length - 1]; // Default to 'Other'
};

// Get all category names
export const getCategoryNames = () => CATEGORIES.map(cat => cat.name);
