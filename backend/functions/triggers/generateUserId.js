export const handler = async (event) => {
  console.log("PreSignUp Trigger Event:", JSON.stringify(event, null, 2));
  return event;
};
