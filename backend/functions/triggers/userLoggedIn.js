module.exports.userLoggedIn = async (event) => {
    console.log("User logged in:", JSON.stringify(event, null, 2));
  
    const userAttributes = event.request.userAttributes;
    const email = userAttributes.email;
  
    if (!email) {
      console.error("Email not found in user attributes");
      return event;
    }
  
    const params = {
      TableName: USERS_TABLE,
      Key: { email },
      UpdateExpression: "SET #lastLoginAt = :lastLoginAt",
      ExpressionAttributeNames: {
        "#lastLoginAt": "lastLoginAt",
      },
      ExpressionAttributeValues: {
        ":lastLoginAt": new Date().toISOString(),
      },
    };
  
    try {
      const command = new UpdateCommand(params);
      await docClient.send(command);
      console.log("Updated last login time for user:", email);
    } catch (error) {
      console.error("Error updating last login time:", error);
    }
  
    return event; // Ensure the Cognito flow continues
  };
  