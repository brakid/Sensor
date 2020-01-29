from datetime import datetime, timedelta
from mongoengine import Document, connect
from mongoengine.fields import StringField, DateTimeField, ReferenceField, FloatField, UUIDField
import graphene
from graphene.relay import Node
from graphene_mongo import MongoengineObjectType
import uuid
from pymongo import DESCENDING, ASCENDING
import os
from token_helper import get_token_helper

token_helper = get_token_helper()

class SensorModel(Document):
    meta = {'collection': 'sensors'}
    identifier = UUIDField(default=uuid.uuid4, unique=True)
    name = StringField(required=True)
    secret = UUIDField(default=uuid.uuid4, unique=True)
    username = StringField(required=True)
 
class SensorValueModel(Document):
    meta = {'collection': 'sensor_values'}
    type = StringField(required=True)
    timestamp = DateTimeField(default=datetime.now)
    sensor = ReferenceField(SensorModel, required=True)
    value = FloatField(required=True)
 
class Sensor(MongoengineObjectType):
    class Meta:
        model = SensorModel
        interfaces = (Node,)
 
class SensorValue(MongoengineObjectType):
    class Meta:
        model = SensorValueModel
        interfaces = (Node,)
 
class Query(graphene.ObjectType):
    node = Node.Field()
    sensors = graphene.List(Sensor)

    def resolve_sensors(self, info):
        try:
            success, token = token_helper.extract_authorization_token(info.context.headers)
            if success:
                valid, username = token_helper.has_valid_token(token)
                if valid:
                    return list(SensorModel.objects(username=username))
            return []
        except:
            return []

    values = graphene.List(SensorValue, sensor_id=graphene.ID(required=True), limit=graphene.DateTime(default_value=datetime.now()-timedelta(days=30)))
 
    def resolve_values(self, info, sensor_id, limit):
        try:
            success, token = token_helper.extract_authorization_token(info.context.headers)
            if success:
                valid, username = token_helper.has_valid_token(token)
                if valid:
                    sensor = SensorModel.objects.get(identifier=sensor_id)

                    if sensor.username == username:
                        return list(SensorValueModel.objects(type='numeric', sensor=sensor, timestamp__gte=limit))
            return []
        except:
            return []

def create_new_sensor(sensorname, username):
    sensor = SensorModel(name=sensorname, username=username)
    sensor.save()
    return sensor

def store_sensor_value(sensor_id, sensor_secret, value, value_type='numeric'):
    sensor = SensorModel.objects.get(identifier=sensor_id)

    if sensor and str(sensor.secret) == sensor_secret:
        sensor_value = SensorValueModel(type=value_type, sensor=sensor, value=value)
        sensor_value.save()

        return sensor_value
    else:
        return False

def initialize_connection():
    mongodb_url = os.environ.get('MONGODB_URL')
    print('Connecting to:', mongodb_url)
    connect('test', host=mongodb_url, alias='default')

def initialize_database():
    SensorModel.drop_collection()
    SensorValueModel.drop_collection()

    SensorValueModel.create_index([('sensor', ASCENDING), ('timestamp', DESCENDING)])

    #sensor = SensorModel(name='Home Temperature', username='hagen')
    #sensor.save()
 
    #temperature = 10.0
    #for _ in range(100):
    #    sensor_value = SensorValueModel(type='numeric', sensor=sensor, value=temperature)
    #    sensor_value.save()
    #    temperature += 0.2