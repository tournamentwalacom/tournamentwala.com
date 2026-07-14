/** "YYYY-MM-DD" for the current date in India, so date comparisons line up
 * with the IST date organizers picked in the form, not the server's UTC
 * date. Kept dependency-free so it's safe to import from client components. */
export function todayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
