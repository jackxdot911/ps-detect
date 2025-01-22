const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

module.exports.userCreated = async (event) => {
  console.log("New user created:", JSON.stringify(event, null, 2));

  // Extract user attributes
  const userAttributes = event.request.userAttributes;
  const userId = `USR${uuidv4().toUpperCase().slice(0, 6)}`;
  const email = userAttributes.email || "";
  const name = userAttributes.name || "";
  const age = ""; // Placeholder for age (not present in Cognito event)
  const created = new Date().toISOString();
  const lastLoginAt = ""; // Initially blank

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId,
      email,
      name,
      age,
      created,
      lastLoginAt,
    },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    console.log("User successfully added to the table:", params.Item);
  } catch (error) {
    console.error("Error adding user to the table:", error);
  }

  return event; // Ensure the Cognito flow continues
};
