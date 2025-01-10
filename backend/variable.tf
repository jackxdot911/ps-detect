# AWS Region
variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

# AWS Account ID
variable "aws_account_id" {
  description = "AWS Account ID for resource ARN construction"
  type        = string
}

# Project prefix for resource naming
variable "project_prefix" {
  description = "Prefix used for naming resources"
  type        = string
  default     = "user_mgmt" 
}

# Cognito User Pool ID
variable "cognito_user_pool_id" {
  description = "ID of existing Cognito User Pool"
  type        = string
  default     = "us-east-1_4CCK4IsXB"
}

# DynamoDB table name
variable "dynamodb_table_name" {
  description = "Name for the DynamoDB table"
  type        = string
  default     = "user_table"
}

variable "cognito_user_pool_arn" {
  description = "ARN of existing Cognito User Pool"
  type        = string
}

# variable "cognito_user_pool_name" {
#   description = "Name of existing Cognito User Pool"
#   type        = string
# }

