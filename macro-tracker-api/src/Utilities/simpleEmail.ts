import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { log, loggingLevels } from "./logger.js";
import { isAwsSesEnabled } from "./featureFlags.js";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION || ("us-east-1" as string),
});

export default async function sendSimpleEmail(
  to: string,
  subject: string,
  body: string,
) {
  if (process.env.NODE_ENV === "TEST") {
    console.log("====================================");
    console.log(`Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("------------------------------------");
    console.log(`Body: ${body}`);
    console.log("====================================");
    return;
  }

  if (!isAwsSesEnabled()) {
    log(loggingLevels.ERROR, "AWS SES is not enabled");
    return;
  }

  const command = new SendEmailCommand({
    FromEmailAddress: process.env.FROM_EMAIL_ADDRESS,
    Destination: {
      ToAddresses: [to],
    },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: body, Charset: "UTF-8" },
          Html: { Data: body, Charset: "UTF-8" },
        },
      },
    },
  });

  try {
    const response = await sesClient.send(command);
    log(loggingLevels.INFO, `Email sent successfully`, { response });
  } catch (error) {
    log(loggingLevels.ERROR, `Error sending email: ${error}`);
    throw error;
  }
}
