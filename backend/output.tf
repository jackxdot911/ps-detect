output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api_gateway.api_endpoint
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.user_table.name
}