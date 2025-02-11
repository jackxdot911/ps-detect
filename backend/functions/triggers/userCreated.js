import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid"; // Import UUID
import { CognitoIdentityServiceProvider } from "aws-sdk";


const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const cognito = new CognitoIdentityServiceProvider();

export const handler = async (event) => {
  console.log("PostAuthentication Event:", JSON.stringify(event, null, 2));

  const userAttributes = event.request.userAttributes;
  const userPoolId = event.userPoolId;
  const username = event.userName;

  // Extract or generate userId
  let userId = userAttributes["custom:userId"];

  try {
    // Generate a userId if it doesn't exist
    if (!userId) {
      userId = `USR${uuidv4().toUpperCase().slice(0, 6)}`;
      console.log("Generated custom userId:", userId);

      // Update user attributes in Cognito
      const updateParams = {
        UserPoolId: userPoolId,
        Username: username,
        UserAttributes: [
          {
            Name: "custom:userId",
            Value: userId,
          },
        ],
      };

      await cognito.adminUpdateUserAttributes(updateParams).promise();
      console.log("Added custom userId to Cognito:", userId);
    }

    // Check if the user exists in DynamoDB using userId as the key
    const getParams = {
      TableName: USERS_TABLE,
      Key: { userId },
    };

    const getCommand = new GetCommand(getParams);
    const { Item } = await docClient.send(getCommand);

    console.log(Item);


    if (Item) {
      console.log("User already exists in DynamoDB:", Item);
    } else {
      // Add new user to DynamoDB
      const created = new Date().toISOString();
      const lastLoginAt = new Date().toISOString();

      const putParams = {
        TableName: USERS_TABLE,
        Item: {
          userId, // Primary key
          email: userAttributes.email || "",
          name: userAttributes.name || "",
          age: "", // Placeholder for age
          created,
          lastLoginAt,
        },
      };

      const putCommand = new PutCommand(putParams);
      const response = await docClient.send(putCommand);
      console.log("New user successfully added to DynamoDB:", response);
    }
  } catch (error) {
    console.error("Error processing PostAuthentication:", error);
    throw error;
  }

  return event;
};
