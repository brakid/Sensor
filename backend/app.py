from flask import Flask, jsonify, g, request
from flask_cors import CORS
from flask_httpauth import HTTPTokenAuth
from token_helper import get_token_helper
from response_utils import * 
from sensors_helper import Query, Sensor, SensorValue, initialize_connection, initialize_database, create_new_sensor, store_sensor_value
from mongoengine import connect
import graphene
from flask_graphql import GraphQLView
import os

debug = os.environ.get('DEBUG', False)

app = Flask(__name__)
auth = HTTPTokenAuth('Bearer')
CORS(app)

token_helper = get_token_helper()
initialize_connection()
#initialize_database()

schema = graphene.Schema(query=Query, types=[Sensor, SensorValue])

view = GraphQLView.as_view('graphql', schema=schema, graphiql=debug)

app.add_url_rule(
    '/api/v1/graphql',
    view_func=auth.login_required(view) if not debug else view
)

@auth.verify_token
def verify_token(token):
    valid, username = token_helper.has_valid_token(token)
    if valid:
        g.current_user = username
        g.token = token
        return True
    g.current_user = None
    g.token = None
    return False

def logout_token(token):
    success, message = token_helper.destroy_and_blacklist_token(g.token)
    g.current_user = None
    g.token = None
    return success, message

@app.errorhandler(400)
def bad_request(error):
    return get_response({ 'error': 'Bad request' }, 400)

@app.errorhandler(404)
def not_found(error):
    return get_response({ 'error': 'Not found' }, 404)

# curl -v -X POST -H 'Content-Type: application/json' -d '{"username":"XXX", "passwordhash":"XXX"}' http://localhost:5000/api/v1/login
@app.route('/api/v1/login', methods = ['POST'])
def login():
    # get the post data
    post_data = request.get_json()

    try:
        username = post_data.get('username')
        password_hash = post_data.get('passwordhash')

        success, token = token_helper.create_token(username, password_hash)
        if success:
            response = {
                'status': 'success',
                'username': username,
                'token': token
                }
            return get_response(response)
        return get_not_successful_response(token)
    except Exception as e:
        print(e)
        return get_not_successful_response('Try again')

# curl -H 'Authorization: Bearer <TOKEN>' http://localhost:5000/api/v1/logout
@app.route('/api/v1/logout', methods = ['GET'])
@auth.login_required
def logout():
    # check user status
    success, message = logout_token(g.token)
    if success:
        response = {
            'status': 'success',
            'message': 'Logged out'
        }
        return get_response(response)
    return get_not_successful_response(message)

# curl -H 'Authorization: Bearer <TOKEN>' http://localhost:5000/api/v1/status
@app.route('/api/v1/status', methods = ['GET'])
def status():
    logged_in, username = token_helper.is_logged_in(request.headers)
    if logged_in:
        _, token = token_helper.extract_authorization_token(request.headers)
        success, new_token = token_helper.refresh_token(token, username)
        if success:
            response = {
                'status': 'success',
                'username': username,
                'token': new_token
            }
            return get_response(response)
        else:
            return get_not_successful_response(new_token)

    response = {
        'status': 'success',
        'message': 'Not logged in'
    }
    return get_response(response)

# curl -X POST -H 'Authorization: Bearer <TOKEN>' -H 'Content-Type: application/json' -d '{"sensorName":"XXX"}' http://localhost:5000/api/v1/newsensor
@app.route('/api/v1/newsensor', methods = ['POST'])
@auth.login_required
def new_sensor():
    # get the post data
    post_data = request.get_json()

    _, username = token_helper.is_logged_in(request.headers)
    try:
        sensorname = post_data.get('sensorName')

        sensor = create_new_sensor(sensorname, username)

        if sensor:
            response = {
                'sensorId': sensor.identifier,
                'sensorSecret': sensor.secret
                }
            return get_response(response)

        return get_not_successful_response('Failed to create a new sensor')
    except Exception as e:
        print(e)
        return get_not_successful_response('Failed to create a new sensor: ' + str(e))

# curl -X POST -H 'Content-Type: application/json' -d '{"sensorId":"123456", "sensorSecret": "123456", value: 10}' http://localhost:5000/api/v1/newvalue
@app.route('/api/v1/newvalue', methods = ['POST'])
def new_sensor_value():
    # get the post data
    post_data = request.get_json()

    try:
        sensor_id = post_data.get('sensorId')
        sensor_secret = post_data.get('sensorSecret')
        value = post_data.get('value')

        sensor_value = store_sensor_value(sensor_id, sensor_secret, value)

        if sensor_value:
            response = {
                'status': 'success'
                }
            return get_response({ 'status': 'success' }, 200)

        return get_not_successful_response('Failed to store sensor value')
    except Exception as e:
        print(e)
        return get_not_successful_response('Failed to store sensor value: ' + str(e))

# curl -H 'Authorization: Bearer <TOKEN>'  http://localhost:5000/secure
@app.route('/secure', methods = ['GET'])
@auth.login_required
def secure_page():
    response = {
        'status': 'success',
        'message': 'Access granted'
    }
    return get_response(response)

@app.route('/')
def hello_world():
    return jsonify('Hello world!')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False)
