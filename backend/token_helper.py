import redis
import jwt
import os
from datetime import datetime, timedelta

class TokenHelper(object):
    def __init__(self):
        self.__redis_connection = redis.from_url(os.environ.get('REDIS_URL', 'redis://:MyRedisPassword@localhost:6379/0'))
        self.__secret_key = os.environ.get('SECRET_KEY')
        self.__username = os.environ.get('USERNAME')
        self.__password_hash = os.environ.get('PASSWORD_HASH')
        
    def __blacklist_token(self, token):
        self.__redis_connection.set(token, 1, ex=(2 * 24 * 60 * 60)) # TTL = 2 days, tokens are valid for 1 day
    
    def __is_token_blacklisted(self, token):
        return not self.__redis_connection.get(token) == None

    def __encode_authorization_token(self, username):
        payload = {
            'exp': datetime.utcnow() + timedelta(days=1),
            'iat': datetime.utcnow(),
            'sub': username
        }
        return jwt.encode(payload, self.__secret_key, algorithm='HS256').decode('utf-8')

    def __decode_authorization_token(self, token):
        try:
            payload = jwt.decode(token, self.__secret_key, algorithms=['HS256'])
            return (True, payload['sub'])
        except jwt.ExpiredSignatureError:
            return (False, 'Signature expired. Please log in again.')
        except jwt.InvalidTokenError:
            return (False, 'Invalid token. Please log in again.')

    def refresh_token(self, token, username):
        new_token = self.__encode_authorization_token(username)
        success, message = self.destroy_and_blacklist_token(token)
        if success:
            return (True, new_token)
        else:
            return (False, message)

    def extract_authorization_token(self, headers):
        if 'Authorization' in headers and 'Bearer ' in headers.get('Authorization'):
            return (True, headers.get('Authorization').split(' ')[1])
        return (False, 'No authorization token found')

    def has_valid_token(self, token):
        try:
            if not self.__is_token_blacklisted(token):
                success, username = self.__decode_authorization_token(token)
                return (success, username)
            return (False, token)
        except:
            return (False, 'Error while checking the status')

    def is_logged_in(self, headers):
        success, token = self.extract_authorization_token(headers)
        if success:
            return self.has_valid_token(token)
        else:
            return (False, token)

    def create_token(self, username, password_hash):
        if username == self.__username and password_hash == self.__password_hash:
            return (True, self.__encode_authorization_token(username))
        return (False, 'Login failed: username and password are not matching')

    def destroy_and_blacklist_token(self, token):
        try:
            self.__blacklist_token(token)
            return (True, 'Blacklisted token')
        except:
            return (False, 'Error while blacklisting')

#memoized token helper
token_helper = None
def get_token_helper():
    global token_helper
    if token_helper == None:
        token_helper = TokenHelper()
    return token_helper