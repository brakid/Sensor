from flask import make_response, jsonify

def get_response(response, status=200):
    return make_response(jsonify(response)), status

def get_not_successful_response(message):
    response = {
        'status': 'fail',
        'message': message
    }
    return get_response(response)