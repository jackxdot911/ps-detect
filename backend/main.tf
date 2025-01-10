# Configure AWS Provider with region
provider "aws" {
  region = var.aws_region
}

# Configure Terraform settings and required providers
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Create DynamoDB table for user data
# Uses PAY_PER_REQUEST billing for cost-effectiveness at varying scales
resource "aws_dynamodb_table" "user_table" {
  name           = var.dynamodb_table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  stream_enabled = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # Primary key attribute
  attribute {
    name = "userId"
    type = "S"  # String type
  }

  # GSI for email lookups
  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name               = "email-index"
    hash_key           = "email"
    projection_type    = "ALL"
  }
}

# IAM role for Lambda functions
# Allows Lambda service to assume this role
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_prefix}_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy attachment for Lambda role
# Grants permissions for DynamoDB operations and CloudWatch Logs
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_prefix}_lambda_policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = [
          aws_dynamodb_table.user_table.arn,
          "${aws_dynamodb_table.user_table.arn}/index/*",
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:*"
        ]
      }
    ]
  })
}

# Lambda functions module
module "lambda_functions" {
  source = "./modules/lambda"

  lambda_role_arn   = aws_iam_role.lambda_role.arn
  user_pool_id      = var.cognito_user_pool_id
  dynamodb_table    = aws_dynamodb_table.user_table.name
  aws_region        = var.aws_region
  aws_account_id    = var.aws_account_id
}

# API Gateway module
module "api_gateway" {
  source = "./modules/api_gateway"
  
  user_pool_arn       = var.cognito_user_pool_arn
  get_user_lambda     = module.lambda_functions.get_user_lambda_arn
  hello_world_lambda  = module.lambda_functions.hello_world_lambda_arn
}
