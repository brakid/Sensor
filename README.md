# Sensor monitor application
### Idea
Utilize a temperature sensor on a RaspberryPi to monitor the temperature in my appartement. 
The data will be emitted periodically (cron-job). 

It should be stored by invoking a REST Api call that includes basic authentication for the emitting job.
The data will be persisted in a MongoDB collection (along with the sensor it belongs to).

There should be a responsive webapp to display the sensor data for the last 30 days (visualization).
The access to the UI and the data in the API (GraphQL for easy data format manipulation) must be protected and 
access to the sensors belonging to the current user must be enforced.

JWT tokens are used as authorization token after a successful login. The token will be cached in the browser and refreshed when it is close to expiry.

To make local deployments easier (for testing), the configuration will be managed in Dockerfiles and docker-compose 
configuration to test all links between the individual components.

### Components
* MongoDB database to store sensors and sensor data
* Redis as cache to store blacklisted tokens (after logout)
* a Python/Flask based backend providing a REST API for storing new sensor data and a GraphQL-based access mechanism to retrieve sensor data
* USWGI as layer in front of the Flask application. Nginx is not needed as the production system will be deployed to Heroku which offers load balancing and reverse proxying capabilities
* a ReactJS webapplication to display the sensor data
* login mechanism: JWT based
