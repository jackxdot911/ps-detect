import boto3
import jwt

def authenticate_and_get_token(username: str, password: str, user_pool_id: str, app_client_id: str) -> None:
    client = boto3.client('cognito-idp')

    try:
        resp = client.admin_initiate_auth(
            UserPoolId=user_pool_id,
            ClientId=app_client_id,
            AuthFlow='ADMIN_USER_PASSWORD_AUTH',
            AuthParameters={
                "USERNAME": username,
                "PASSWORD": password
            }
        )

        print("Log in success")
        print("Access token:", resp['AuthenticationResult']['AccessToken'])
        print("ID token:", resp['AuthenticationResult']['IdToken'])

        # Decode the ID token
        decoded_token = jwt.decode(resp['AuthenticationResult']['IdToken'], options={"verify_signature": False})
        email = decoded_token.get('email', 'Email not found in token')
        print("Email:", email)
    
    except client.exceptions.NotAuthorizedException:
        print("Error: Incorrect username or password.")
    
    except client.exceptions.UserNotFoundException:
        print("Error: User not found.")
    
    except Exception as e:
        print(f"Unexpected error: {e}")

# Call the function with your credentials
authenticate_and_get_token('nishan.kumar@7edge.com',
                            'Poiuy@09876', 
                            'us-east-1_0CLbqEKoy', 
                            '21od8gs8rm64ac7ah555asiun3')
