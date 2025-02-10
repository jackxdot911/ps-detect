FROM public.ecr.aws/lambda/nodejs:20

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy handler code
COPY poseHandler.js ./

# Set the Lambda handler
CMD [ "poseHandler.handler" ]
