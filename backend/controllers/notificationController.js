
import User from "../src/models/User.js";

export const getVapidKey = (req, res) => {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(500).json({ success: false, message: "VAPID public key not configured" });
    }
    return res.status(200).json({ success: true, publicKey });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Error fetching VAPID key" });
  }
};

export const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ success: false, message: "No subscription provided" });
    }

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    user.pushSubscription = subscription;
    await user.save();

    return res.status(200).json({ success: true, message: "Push subscription saved successfully" });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return res.status(500).json({ success: false, message: "Error saving subscription" });
  }
};

export const updateActiveRoutines = async (req, res) => {
  try {
    const { activeRoutineIds } = req.body;
    if (!Array.isArray(activeRoutineIds)) {
      return res.status(400).json({ success: false, message: "activeRoutineIds must be an array" });
    }

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    user.activeRoutineIds = activeRoutineIds;
    await user.save();

    return res.status(200).json({ success: true, message: "Active routines updated successfully" });
  } catch (error) {
    console.error("Error updating active routines:", error);
    return res.status(500).json({ success: false, message: "Error updating active routines" });
  }
};
