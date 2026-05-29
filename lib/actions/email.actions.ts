import { BrevoClient } from "@getbrevo/brevo";

import { siteConfig } from "@/lib/siteConfig";

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export const sendEmailNotification = async (
  email: string,
  content: string,
  subject: string = `Appointment Notification - ${siteConfig.name}`
) => {
  const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || siteConfig.name;
  const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "onboarding@brevo.com";

  try {
    const response = await client.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #24AE7C;">${siteConfig.name} Appointment Update</h2>
          <p>Hello,</p>
          <p>${content}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #777;">
            This is an automated message from ${siteConfig.name}. Please do not reply to this email.
          </p>
        </div>
      `,
      sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
      to: [{ email }],
    });

    if (response.messageId) {
      console.log("Email sent successfully via Brevo SDK. Message ID:", response.messageId);
      return response;
    } else {
      console.error("Brevo accepted the request but did not return a messageId:", response);
      return null;
    }
  } catch (error: any) {
    console.error("An error occurred while sending email via Brevo SDK:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message || error);
    }
    return null;
  }
};
