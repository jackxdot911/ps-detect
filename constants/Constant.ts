const constants = {
    stage: process.env.EXPO_PUBLIC_REISTTA_MERCHANT_STAGE || 'dev',
    baseUrl:
      "https://" +
      `${process.env.EXPO_PUBLIC_REISTTA_MERCHANT_DOMAIN_NAME}/${process.env.EXPO_PUBLIC_REISTTA_MERCHANT_STAGE}/v1/` || '',
    region: process.env.EXPO_PUBLIC_REISTTA_MERCHANT_REGION || '',
    awsConfig: {
      Auth: {
        Cognito: {
          region: process.env.EXPO_PUBLIC_REISTTA_MERCHANT_REGION || "us-east-1",
          userPoolId: process.env.EXPO_PUBLIC_REISTTA_MERCHANT_COGNITO_USERPOOL_ID || '',
          userPoolClientId: process.env.EXPO_PUBLIC_REISTTA_MERCHANT_COGNITO_USERPOOL_CLIENT_ID || '',
        },
      },
      Storage: {
        S3: {
          bucket: process.env.EXPO_PUBLIC_REISTTA_MERCHANT_BUCKET_NAME || '',
          region: process.env.EXPO_PUBLIC_REISTTA_MERCHANT_REGION || "us-east-1",
        },
      },
    },
  };
  
  export default constants;