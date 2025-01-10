variable "lambda_role_arn" {
  description = "ARN of the IAM role for Lambda functions"
  type        = string
}

variable "user_pool_id" {
  description = "ID of the Cognito User Pool"
  type        = string
}

variable "dynamodb_table" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "aws_region" {
  description = "AWS Region"
  default     = "us-east-1" # Update as needed
}

variable "aws_account_id" {
  description = "AWS Account ID"
}


