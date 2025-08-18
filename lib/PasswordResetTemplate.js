module.exports = PasswordResetTemplate = ({
  RESET_LINK,
  ExpiredIn = "15 min",
}) => {
  return `<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" bgcolor="#f4f4f7" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);padding:40px;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="margin:0;font-size:24px;color:#333333;">Reset Your Password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 20px; color:#555555; font-size:16px; line-height:1.6;">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to create a new one. This link is only valid for a ${ExpiredIn}.</p>
              <p>If you didn’t request a password reset, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="${RESET_LINK}" style="background-color:#4F46E5;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;display:inline-block;font-weight:bold;font-size:16px;">
                Reset Password
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 20px; color:#777777; font-size:14px; line-height:1.4;">
              <p>If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all;"><a href="${RESET_LINK}" style="color:#4F46E5;text-decoration:none;">${RESET_LINK}</a></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 40px; font-size:12px; color:#999999;">
              <p>&copy; 2025 RunWeek. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
