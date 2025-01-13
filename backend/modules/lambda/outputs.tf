# Outputs for Lambda ARNs
output "get_user_lambda_arn" {
  value = aws_lambda_function.get_user.arn
}

output "hello_world_lambda_arn" {
  value = aws_lambda_function.hello_world.arn
}

output "post_auth_lambda_arn" {
  value = aws_lambda_function.post_auth.arn
}