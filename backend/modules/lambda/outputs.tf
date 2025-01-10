output "get_user_lambda_arn" {
  description = "ARN of the get user Lambda function"
  value = aws_lambda_function.get_user.arn
}

output "hello_world_lambda_arn" {
  description = "ARN of the hello world Lambda function"
  value = aws_lambda_function.hello_world.arn
}