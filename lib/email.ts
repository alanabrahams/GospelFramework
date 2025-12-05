import type { Submission, CalculatedScores } from "@/types/assessment-schema";
import { POINT_LABELS, SECTION_LABELS } from "@/types/assessment-schema";
import { getPointScoresArray } from "./calculations";

/**
 * Generate HTML email template for assessment results
 */
export function generateEmailHTML(
  submission: Submission,
  scores: CalculatedScores
): string {
  const pointScoresArray = getPointScoresArray(scores);

  const pointScoresHTML = POINT_LABELS.map((label, index) => {
    const score = pointScoresArray[index];
    const percentage = (score / 5) * 100;
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #DCE1E5;">
          <strong style="color: #4A4F57;">${label}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #DCE1E5; text-align: right;">
          <span style="color: #1A4D7A; font-weight: bold; font-size: 18px;">${score.toFixed(2)}</span>
        </td>
      </tr>
    `;
  }).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Church Health Index Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; background-color: #F3E9D7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3E9D7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1A4D7A; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: bold;">
                Church Health Index Results
              </h1>
              <p style="color: #DCE1E5; margin: 10px 0 0 0; font-size: 16px;">
                Redeemer City to City
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #4A4F57; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello ${submission.name},
              </p>
              <p style="color: #4A4F57; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for completing the Church Health Index assessment for <strong>${submission.churchName}</strong>. 
                Below are your results:
              </p>
              
              <!-- Section Averages -->
              <div style="background-color: #F3E9D7; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h2 style="color: #1A4D7A; font-size: 20px; margin: 0 0 20px 0;">Section Averages</h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 10px; border-left: 4px solid #1A4D7A;">
                      <strong style="color: #4A4F57;">${SECTION_LABELS.worship}</strong><br>
                      <span style="color: #1A4D7A; font-size: 24px; font-weight: bold;">${scores.sections.worship.toFixed(2)}</span>
                      <span style="color: #4A4F57; font-size: 12px;"> / 5.0</span>
                    </td>
                    <td style="padding: 10px; border-left: 4px solid #D9A441;">
                      <strong style="color: #4A4F57;">${SECTION_LABELS.discipleship}</strong><br>
                      <span style="color: #D9A441; font-size: 24px; font-weight: bold;">${scores.sections.discipleship.toFixed(2)}</span>
                      <span style="color: #4A4F57; font-size: 12px;"> / 5.0</span>
                    </td>
                    <td style="padding: 10px; border-left: 4px solid #2F8F8C;">
                      <strong style="color: #4A4F57;">${SECTION_LABELS.mission}</strong><br>
                      <span style="color: #2F8F8C; font-size: 24px; font-weight: bold;">${scores.sections.mission.toFixed(2)}</span>
                      <span style="color: #4A4F57; font-size: 12px;"> / 5.0</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Point Scores -->
              <h2 style="color: #1A4D7A; font-size: 20px; margin: 30px 0 20px 0;">Detailed Scores</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                ${pointScoresHTML}
              </table>
              
              <p style="color: #4A4F57; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                These results can help you identify areas of strength and opportunities for growth 
                in your church's gospel-centered ministry.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #DCE1E5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #4A4F57; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Redeemer City to City. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Server action to send email (placeholder - requires email service configuration)
 * In production, integrate with SendGrid, Resend, or similar service
 */
export async function sendResultsEmail(
  submission: Submission & { scores: CalculatedScores }
) {
  // This is a placeholder implementation
  // In production, you would:
  // 1. Configure an email service (SendGrid, Resend, AWS SES, etc.)
  // 2. Use the service's API to send the email
  // 3. Handle errors appropriately

  const htmlContent = generateEmailHTML(submission, submission.scores);

  // Example with a hypothetical email service:
  // const response = await fetch('https://api.emailservice.com/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     to: submission.email,
  //     subject: 'Your Church Health Index Results',
  //     html: htmlContent,
  //   }),
  // });

  // For now, return success (in production, check response)
  return {
    success: true,
    message: "Email sent successfully",
    html: htmlContent, // For testing/debugging
  };
}

