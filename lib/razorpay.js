import Razorpay from "razorpay";

let client = null;

/**
 * Lazily-created singleton so a missing env var only throws when a route
 * actually needs to talk to Razorpay, not at module load / build time.
 */
export function razorpayClient() {
  if (!client) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET).");
    }
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}
