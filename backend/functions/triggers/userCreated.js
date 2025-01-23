const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async (event) => {
  console.log("PostAuthentication Event:", JSON.stringify(event, null, 2));

  const userAttributes = event.request.userAttributes;

  // Extract user attributes
  const userId = `USR${uuidv4().toUpperCase().slice(0, 6)}`;
  const email = userAttributes.email || "";
  const name = userAttributes.name || "";
  const age = ""; // Placeholder for age (not present in Cognito event)
  const created = new Date().toISOString();
  const lastLoginAt = new Date().toISOString(); // Initially blank

  try {
    // Query the table to check if the user exists by email
    const queryParams = {
      TableName: USERS_TABLE,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const queryCommand = new QueryCommand(queryParams);
    const { Items } = await docClient.send(queryCommand);

    console.log(Items);

    if (Items && Items.length > 0) {
      console.log("User already exists:", Items[0]);
    } else {
      // Add new user
      const putParams = {
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
      const putCommand = new PutCommand(putParams);
      await docClient.send(putCommand);
      console.log("New user successfully added:", putParams.Item);
    }
  } catch (error) {
    console.error("Error adding user:", error);
  }

  return event;
};
