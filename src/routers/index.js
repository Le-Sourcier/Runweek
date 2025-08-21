const express = require("express");
const router = express.Router();
const { authorize } = require("../middlewares/authMiddleware");

router
  .use("/user", authorize, require("./components/userRouter"))

  .use("/notif", authorize, require("./components/notificationsRouter"))
  .use("/sponsor", authorize, require("./components/sponsorRouter"))
  .use("/stripe", authorize, require("./components/stripeProductRouter"))
  .use("/activities", authorize, require("./components/activityRouter"))

  .use("/auth", require("./components/googleAuthRouter"))
  .use("/google/fit", authorize, require("./components/googleFitRouter"))

  .use("/aicoach", authorize, require("./components/aiCoachRouter"))

  .use(
    "/personal-records",
    authorize,
    require("./components/personalRecordsRouter")
  )
  .use("/goals", authorize, require("./components/goalsRouter"))
  .use("/friends", authorize, require("./components/friendsRouter"))
  .use("/nutrition", authorize, require("./components/nutritionRouter"))
  .use("/health", authorize, require("./components/healthRouter"))
  .use("/achievements", authorize, require("./components/achievementRouter"));
// router.use("/comments", authorize, require("./components/commentRouter"));
// router.use("/reports", authorize, require("./components/reportRouter"));
// router.use("/challenges", authorize, require("./components/challengeRouter"));
// router.use("/stats", authorize, require("./components/statsRouter"));

module.exports = router;
