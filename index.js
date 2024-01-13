const express = require("express");
const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
require("dotenv").config();

// Instance of Express
const app = express();
const port = process.env.PORT;

// Scopes and Credentials path for Gmail API
const SCOPE = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];
const CREDENTIALS_PATH = "credentials.json";

// Function to authenticate and authorize with Gmail API
const authorize = async () => {
  const auth = await authenticate({
    keyfilePath: CREDENTIALS_PATH,
    scopes: SCOPE,
  });

  // Gmail API client
  const gmail = google.gmail({ version: "v1", auth });

  // Retrieve and log user's labels
  const response = await gmail.users.labels.list({
    userId: "me",
  });

  console.log("User Labels:", response.data.labels);

  return auth;
};

// Function to get unread messages from the user's inbox
const getMessages = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    q: "is:unread",
  });

  return response.data.messages || [];
};

// Function to create or retrieve the Auto_Reply label
const changeLabel = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });
  try {
    // Attempt to create the Auto_Reply label
    const response = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: "Auto_Reply",
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    console.log("Auto_Reply Label Created:", response.data);
    return response.data.id;
  } catch (error) {
    // If the label already exists, retrieve its ID
    if (error.code === 409) {
      const response = await gmail.users.labels.list({
        userId: "me",
      });
      const label = response.data.labels.find(
        (label) => label.name === "Auto_Reply"
      );
      console.log("Auto_Reply Label Already Exists");
      return label.id;
    } else {
      throw error;
    }
  }
};

// Main function to continuously check for new messages and send Auto_replies
const main = async () => {
  const auth = await authorize();
  const labelId = await changeLabel(auth);
  const gmail = google.gmail({ version: "v1", auth });

  // Set interval to check for new messages
  setInterval(async () => {
    const messages = await getMessages(auth);

    if (messages.length) {
      console.log("New messages found...");

      // Process each new message
      for (const message of messages) {
        const response = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });

        const mail = response.data;
        console.log("Processing mail:", mail);

        // Create a reply message
        const replyMessage = {
          userId: "me",
          resource: {
            raw: Buffer.from(
              `To: ${
                mail.payload.headers.find(
                  (header) => header.name === "From"
                ).value
              }\r\n` +
                `Subject: Re: ${
                  mail.payload.headers.find(
                    (header) => header.name === "Subject"
                  ).value
                }\r\n` +
                `Content-Type: text/plain; charset="UTF-8"\r\n` +
                `Content-Transfer-Encoding: 7bit\r\n\r\n` +
                `Thank you for your email. I'll get back to you soon.\r\n`
            ).toString("base64"),
          },
        };

        console.log("Auto_reply staged to send...");
        await gmail.users.messages.send(replyMessage);
        console.log("Auto_reply sent...");

        // Add label and move the email
        await gmail.users.messages.modify({
          auth,
          userId: "me",
          id: message.id,
          resource: {
            addLabelIds: [labelId],
            removeLabelIds: ["INBOX"],
          },
        });

        console.log("Email processed and labeled as Auto_Reply");
      }
    } else {
      console.log("No new messages");
    }
  }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);
};

// Route to trigger the main function
app.get("/", async (req, res) => {
  main();
  res.send("Auto_Reply process initiated. Check console for logs.");
});

// Starting the Express app on the specified port
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
