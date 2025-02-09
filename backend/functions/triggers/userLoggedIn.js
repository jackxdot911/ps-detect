import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";


const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async (event) => {
    console.log("User logged in:", JSON.stringify(event, null, 2));
  
    const userAttributes = event.request.userAttributes;
    const email = userAttributes.email;
  
    if (!email) {
      console.error("Email not found in user attributes");
      return event;
    }
    try {
      // Query the table to get the userId by email
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
        const userId = Items[0].userId;
  
        // Update lastLoginAt for the user
        const updateParams = {
          TableName: USERS_TABLE,
          Key: { userId },
          UpdateExpression: "SET #lastLoginAt = :lastLoginAt",
          ExpressionAttributeNames: {
            "#lastLoginAt": "lastLoginAt",
          },
          ExpressionAttributeValues: {
            ":lastLoginAt": new Date().toISOString(),
          },
        };
  
        const updateCommand = new UpdateCommand(updateParams);
        await docClient.send(updateCommand);
        console.log("Updated last login time for user:", email);
      } else {
        console.error("User not found for email:", email);
      }
    } catch (error) {
      console.error("Error updating last login time:", error);
    }
  
    return event;
  };
  