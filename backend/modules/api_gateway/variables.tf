variable "user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  type        = string
}

variable "get_user_lambda" {
  description = "ARN of the get user Lambda function"
  type        = string
}

variable "hello_world_lambda" {
  description = "ARN of the hello world Lambda function"
  type        = string
}