const jwt = require("jsonwebtoken");
const db = require("../models");

const rateLimit = require("express-rate-limit");
const { serverMessage } = require("../utils");

const unprotectedRoutes = [
    "/api/user/login",
    "/api/user/register",
    "/api/user/refresh",
    "/api/user/activities",
    "/api/user/verify-token",
    "/api/user/reset-password",
    "/api/user/forget-password",
    "/api/user/verify-mail",
    "/api/user/resend-mail",
    "/check-referral-code/:referral_code",
    "/api/stripe/products",
    // "/api/stripe/product/:id",
    "/api/stripe/checkout/get-session/:session_id",
];

// Function to convert a route with parameters into regex
const routeToRegex = (route) => {
    const pattern = route
        .replace(/\/:[\w-]+/g, "/([^/]+)") //Replace :param with capture groups
        .replace(/\//g, "\\/"); //Escape the slashes

    return new RegExp(`^${pattern}$`);
};

//Pre-compile regexes for unprotected routes
const unprotectedRegexes = unprotectedRoutes.map(routeToRegex);

// User status constants
const USER_STATUSES = {
    UNVERIFIED: "UNVERIFIED",
    VERIFIED: "VERIFIED",
    ARCHIVED: "ARCHIVED",
    BLOCKED: "BLOCKED",
};
const authorize = async (req, res, next) => {
    const path = req.originalUrl.split("?")[0];
    // if (unprotectedRoutes.includes(path)) {
    //     return next();
    // }
    const isUnprotected = unprotectedRegexes.some((regex) => regex.test(path));

    if (isUnprotected) {
        return next();
    }

    const authHeader = req.headers.authorization;
    // Verify if the Authorization header is present and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return serverMessage(res, "FORBIDDEN_RESOURCE");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db.Users.findByPk(decoded.id, {
            include: [{ model: db.Profiles, as: "profile" }],
        });

        if (!user) {
            return serverMessage(res, "ACCOUNT_NOT_FOUND");
        }

        "UNVERIFIED", "VERIFIED", "ARCHIVED", "BLOCKED";
        if (user && user.status === "") {
            return serverMessage(res, "ACCOUNT_NOT_FOUND");
        }
        // Users can have different statuses like UNVERIFIED, VERIFIED, ARCHIVED, BLOCKED
        switch (user.status) {
            case USER_STATUSES.ARCHIVED:
                return serverMessage(res, "ACCOUNT_ARCHIVED");
            case USER_STATUSES.BLOCKED:
                return serverMessage(res, "ACCOUNT_BLOCKED");
            case USER_STATUSES.UNVERIFIED:
                return serverMessage(res, "ACCOUNT_UNVERIFIED");
            case USER_STATUSES.VERIFIED:
                // User is active, continue
                req.user = user;
                return next();
            default:
                // Unknown or empty status
                return serverMessage(res, "ACCOUNT_NOT_FOUND");
        }
    } catch (err) {
        console.log("MIDDLEWARE: ", err);
        if (err.name === "TokenExpiredError") {
            return serverMessage(res, "TOKEN_EXPIRED");
        }

        if (err.name === "JsonWebTokenError") {
            return serverMessage(res, "TOKEN_INVALID");
        }

        return serverMessage(res);
    }
};

// Middleware to limit login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, //limit each IP to 5 requests per windows
    message: serverMessage(null, "TOO_MANY_ATTEMPTS"),
    standardHeaders: true, // returns the standard rate limit headers
    legacyHeaders: false, // disables X-RateLimit-* headers
});
if (process.env.NODE_ENV === "production") {
    // Apply the rate limiter to all login routes
    unprotectedRoutes.push("/api/user/login");
}
module.exports = { authorize, loginLimiter };
