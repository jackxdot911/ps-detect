const { v4: uuidv4 } = require("uuid"); // For generating unique IDs

exports.handler = async (event) => {
  console.log("PreSignUp Trigger Event:", JSON.stringify(event, null, 2));

  // Generate a custom userId
  const userId = `USR${uuidv4().toUpperCase().slice(0, 6)}`;

  // Add the custom userId to event.request.userAttributes
  event.request.userAttributes["custom:userId"] = userId;

  console.log("Generated custom userId:", userId);

  // Return the event object as is
  return event;
};
