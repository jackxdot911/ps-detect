module.exports.handler = async (event) => {
    console.log("New user created:", JSON.stringify(event, null, 2));
  
    // Placeholder for future meaningful content
    // You can access event.userName, event.request.userAttributes, etc.
  
    return event; // Required to ensure the Cognito flow continues
  };
  