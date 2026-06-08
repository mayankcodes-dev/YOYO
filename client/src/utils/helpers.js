/**
 * Shared utility helpers — single source of truth
 */

/**
 * Strip HTML tags from a string before sending to the API.
 * Prevents stored XSS from user-supplied form fields.
 */
export const sanitize = (str = "") => str.replace(/<[^>]*>/g, "").trim();

/**
 * Format a date string to a readable locale date.
 * @param {string} dateStr  ISO date string
 * @param {string} locale   BCP 47 locale tag (default "en-IN")
 */
export const formatDate = (dateStr, locale = "en-IN") =>
  new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/**
 * Calculate the number of nights between two date strings.
 * Returns 0 if either date is missing.
 */
export const calcNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return Math.max(
    0,
    Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86_400_000)
  );
};
