const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Post-authentication Lambda trigger for Cognito
 * Creates or updates user record in DynamoDB after successful authentication
 * @param {Object} event - Cognito authentication event
 */
exports.handler = async (event) => {
  const { userPoolId, userName, request } = event;
  const timestamp = new Date().toISOString();
  
  // Generate unique user ID with USR prefix and 5 random digits
  const userId = `USR${Math.random().toString().slice(2, 7)}`;
  
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      userId: userId,
      email: event.request.userAttributes.email,
      cognitoId: userName,
      createdAt: timestamp,
      lastLoginAt: timestamp
    }
  };
  
  try {
    await dynamodb.put(params).promise();
    return event;  // Return event to continue Cognito workflow
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
