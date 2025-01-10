# Post Authentication Lambda Function
# Triggered after successful Cognito authentication
resource "aws_lambda_function" "post_auth" {
  filename         = data.archive_file.post_auth_lambda.output_path
  function_name    = "post_auth"
  role            = var.lambda_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"

  # Environment variables available to the function
  environment {
    variables = {
      DYNAMODB_TABLE = var.dynamodb_table
    }
  }
}

# Get User Details Lambda Function
# Retrieves user information from DynamoDB
resource "aws_lambda_function" "get_user" {
  filename         = data.archive_file.get_user_lambda.output_path
  function_name    = "get_user"
  role            = var.lambda_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"

  environment {
    variables = {
      DYNAMODB_TABLE = var.dynamodb_table
    }
  }
}

# Hello World Lambda Function
# Simple demonstration endpoint
resource "aws_lambda_function" "hello_world" {
  filename         = data.archive_file.hello_world_lambda.output_path
  function_name    = "hello_world"
  role            = var.lambda_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
}

# Lambda function source code archives
data "archive_file" "post_auth_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/src/post_auth"
  output_path = "${path.module}/files/post_auth.zip"
}

data "archive_file" "get_user_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/src/get_user"
  output_path = "${path.module}/files/get_user.zip"
}

data "archive_file" "hello_world_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/src/hello_world"
  output_path = "${path.module}/files/hello_world.zip"
}

# Permission for Cognito to invoke post-auth Lambda
resource "aws_lambda_permission" "cognito_post_auth" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_auth.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = "arn:aws:cognito-idp:${var.aws_region}:${var.aws_account_id}:userpool/${var.user_pool_id}"
}
