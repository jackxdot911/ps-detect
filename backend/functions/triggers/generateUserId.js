const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  console.log("PreSignUp Trigger Event:", JSON.stringify(event, null, 2));

  // Generate a custom userId
  const userId = `USR${uuidv4().toUpperCase().slice(0, 6)}`;

    const params = {
        UserPoolId: event.userPoolId,
        Username: event.userName,
        UserAttributes: [
            {
                Name: "custom:userId",
                Value: userId,
            },
        ],
    };

    await cognito.adminUpdateUserAttributes(params).promise();

  console.log("Modified Event:", JSON.stringify(event, null, 2));

  console.log("Generated custom userId:", userId);

  // Return the event object as is
  return event;
};
