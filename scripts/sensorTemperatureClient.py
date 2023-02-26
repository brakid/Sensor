#!/usr/bin/python
# -*- coding: utf-8 -*-

import re, os, time, requests, json
from kafka import KafkaProducer

sensor_id = os.environ.get('SENSOR_ID')
sensor_secret = os.environ.get('SENSOR_SECRET')

kafka_host = os.environ.get('KAFKA_HOST')
producer = KafkaProducer(bootstrap_servers=[kafka_host], value_serializer=lambda x: json.dumps(x).encode('utf-8'))

def read_temperature_sensor(path):
	value = 'U'
	try:
		f = open(path, 'r')
		line = f.readline()
		if re.match(r'([0-9a-f]{2} ){9}: crc=[0-9a-f]{2} YES', line):
			line = f.readline()
			m = re.match(r'([0-9a-f]{2} ){9}t=([+-]?[0-9]+)', line)
			if m:
				value = str(float(m.group(2)) / 1000.0)
		f.close()
	except IOError as e:
		print time.strftime('%x %X'), 'Error reading', path, ' : ', e
	return float(value) - 1

path = '/sys/devices/w1_bus_master1/28-000006dd9b7c/w1_slave'

temperature = read_temperature_sensor(path)

payload = {'sensorId': sensor_id, 'sensorSecret': sensor_secret, 'value': temperature}
headers = {'content-type': 'application/json'}

response = requests.post('https://<BACKEND-URL>/api/v1/newvalue', data=json.dumps(payload), headers=headers)

if response.status_code != 200:
    print time.strftime('%x %X'), 'Error pushing temperature data', response.status_code, response.text

producer.send('temperature', {'sensorId': sensor_id, 'value': temperature})
producer.flush()
