const express = require("express");
const router = express.Router();
const { authorize } = require("../middlewares/authMiddleware");

router.use("/user", authorize, require("./components/userRouter"));

router.use("/notif", authorize, require("./components/notificationsRouter"));
router.use("/sponsor", authorize, require("./components/sponsorRouter"));
router.use("/stripe", authorize, require("./components/stripeProductRouter"));
router.use("/activities", authorize, require("./components/activityRouter"));
router.use("/goals", authorize, require("./components/goalRouter"));

router.use("/auth/google", require("./components/googleAuthRouter"));
router.use("/google/fit", authorize, require("./components/googleFitRouter"));

router.use("/aicoach", authorize, require("./components/aiCoachRouter"));
router.use("/nutrition", authorize, require("./components/nutritionRouter"));
router.use("/friends", authorize, require("./components/friendRouter"));
router.use("/shared-meals", authorize, require("./components/sharedMealRouter"));

module.exports = router;
