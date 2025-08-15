// src/utils/helpers.ts

/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Formats a date to "DD MMM YYYY" format
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Generates a random ID (for temporary keys in UI)
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Shortens a text to a specified length and adds ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};
