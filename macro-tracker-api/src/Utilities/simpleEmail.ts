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
  // TODO: Implement email sending
  throw new Error("Email sending not implemented");
}
