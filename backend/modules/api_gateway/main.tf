# Create API Gateway REST API
resource "aws_api_gateway_rest_api" "main" {
  name = "user_management_api"
  description = "API for user management functions"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Cognito User Pool Authorizer
resource "aws_api_gateway_authorizer" "cognito" {
  name          = "cognito_authorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.main.id
  provider_arns = [var.user_pool_arn]
}

# GET /user endpoint - Protected by Cognito
resource "aws_api_gateway_resource" "user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "user"
}

resource "aws_api_gateway_method" "get_user" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.get_user.http_method
  type        = "AWS_PROXY"
  uri         = "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/${var.get_user_lambda}/invocations"
  integration_http_method = "POST"
}

# GET /hello endpoint - Public
resource "aws_api_gateway_resource" "hello" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "hello"
}

resource "aws_api_gateway_method" "hello_world" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.hello.id
  http_method   = "GET"
  authorization = "NONE"  # Public endpoint
}

resource "aws_api_gateway_integration" "hello_world" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.hello.id
  http_method = aws_api_gateway_method.hello_world.http_method
  type        = "AWS_PROXY"
  uri         = "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/${var.hello_world_lambda}/invocations"
  integration_http_method = "POST"
}

# API Deployment and Stage
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  
  depends_on = [
    aws_api_gateway_integration.get_user,
    aws_api_gateway_integration.hello_world
  ]
}

resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id  = aws_api_gateway_rest_api.main.id
  stage_name   = "prod"
}