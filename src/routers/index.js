const express = require("express");
const router = express.Router();
const { authorize } = require("../middlewares/authMiddleware");

router.use("/user", authorize, require("./components/userRouter"));

router.use("/notif", require("./components/activitiesRouter"));
router.use("/sponsor", require("./components/sponsorRouter"));
router.use("/stripe", authorize, require("./components/stripeProductRouter"));
module.exports = router;
