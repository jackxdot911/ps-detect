import boto3

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
    
    except client.exceptions.NotAuthorizedException:
        print("Error: Incorrect username or password.")
    
    except client.exceptions.UserNotFoundException:
        print("Error: User not found.")
    
    except Exception as e:
        print(f"Unexpected error: {e}")

# Call the function with your credentials
authenticate_and_get_token('nishankumar559@gmail.com',
                            'Poiuy@09876', 
                            'us-east-1_ePLUL9Wyz', 
                            '5imlnro24sus4iai99m1379njf')
