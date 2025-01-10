output "api_endpoint" {
  description = "Base URL of the API Gateway stage"
  value = aws_api_gateway_stage.main.invoke_url
}