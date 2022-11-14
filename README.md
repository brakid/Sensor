# Sensor monitor application
### Idea
Utilize a temperature sensor on a RaspberryPi to monitor the temperature in my appartement. 
The data will be emitted periodically (cron-job). 

It should be stored by invoking a REST API call that includes basic authentication for the emitting job.
The data will be persisted in a MongoDB collection (along with the sensor it belongs to).

There should be a responsive webapp to display the sensor data for the last 30 days (visualization).
The access to the UI and the data in the API (GraphQL for easy data format manipulation) must be protected and 
access to the sensors belonging to the current user must be enforced.

JWT tokens are used as authorization token after a successful login. The token will be cached in the browser and refreshed when it is close to expiry.

To make local deployments easier (for testing), the configuration will be managed in [Dockerfiles](https://www.docker.com/) and a docker-compose configuration to test all links between the individual components.

### Components
* [MongoDB](https://www.mongodb.com) database to store sensors and sensor data
* [Redis](https://redis.io/) as cache to store blacklisted tokens (after logout)
* a Python/[Flask](https://flask.palletsprojects.com/en/1.1.x/) based backend providing a REST API for storing new sensor data and a GraphQL-based access mechanism to retrieve sensor data
* [USWGI](https://uwsgi-docs.readthedocs.io/en/latest/) as layer in front of the Flask application. Nginx is not needed as the production system will be deployed to [Heroku](https://heroku.com/) which provides load balancing and reverse proxying capabilities for its dynos
* a [ReactJS](https://reactjs.org/) webapplication to display the sensor data, it uses the [Apollo client](https://www.apollographql.com/docs/react/) to access the [GraphQL](https://graphql.org/) endpoint
* login mechanism: [JWT](https://jwt.io/) based ([tutorial](https://realpython.com/token-based-authentication-with-flask/))
* a Python script to read the sensor values on the RaspberryPi, triggered by a cron-job

### How is it working?
#### The backend
The backend application is the central part of the monitoring project. It is responsible for providing data to requesters, performing checks whether the user is authorized to access data and to ingest new data provided by sensors.

To store the sensor data permanently it writes them to a MongoDB collection. To avoid low level access to read and write data to the database, the [graphene-mongo](https://github.com/graphql-python/graphene-mongo) libray is used as an abstraction layer dealing with creating new collections and writing and reading the objects from and to the database engine. It also allows an easy linking between the MongoDB collections and the GraphQL endpoint provided by the application. 

Authorization and authentication is done via JSON Web Tokens (JWT): the token are encrypted token storing the expiration date and the user they belong to. During the authentication, the user proves his/her identity using a plain old username-password combination and receives his/her token. The user cannot manipulate the token content as it is encrypted on server side. This allows the server to verify the tokens presented by users in other operations as only the server is able to decrypt the token. The token needs to be passed in the *Authorization* header:

```
curl -H 'Authorization: Bearer <TOKEN>' http://localhost:5000/api/v1/status
```

Each token contains an expiry date after which it is no longer accepted. To avoid having to login repeatedly, users can request their token to by refreshed. The old token then will be blacklisted. Same happens after the user logs out.

Blacklisting a token means that it no longer can be used for accessing restricted API resources such as reading sensor values. The blacklisted tokens are stored in a Redis cache. To avoid the cache from growing over time, each record has a TTL that needs to be longer than the period the token is valid:

```
redis_connection.set(token, 1, ex=(2 * 24 * 60 * 60)) # TTL = 2 days, tokens are valid for 1 day
```

As the Flask GraphQL library offers to protect the GraphQL endpoint with an Authorization method: 

```
from flask_httpauth import HTTPTokenAuth

app = Flask(__name__)
auth = HTTPTokenAuth('Bearer')

view = GraphQLView.as_view('graphql', schema=schema, graphiql=debug)

app.add_url_rule(
    '/api/v1/graphql',
    view_func=auth.login_required(view)
)
```

This feature is also used then to limit the access of authenticated users to those sensor resources they own.

As each token stores the identity of the user (in this project in form of a username), this information is then used to limit access to those sensors the user owns:

```
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
```

In a GraphQL query, the info parameter of each resolver contains the context of the call such as the request headers. As the token needs to be provided in that way, we can use it to get the user identity and limit resource access.

#### The frontend
To provide an easy mechanism to access the sensor data, a webapplication is part of the project. It is not served by the backend server (to separate concerns, as the webapp is just one way to access the data).

The webapplication is written using the ReactJS framework. It provides deeplink access to sensors via [React Router](https://reacttraining.com/react-router/). To keep the state of the application, [Redux](https://redux.js.org/) is used: it stores the sensors of a user and the currently selected sensor inside the application.

To keep each component as shallow as possible, functional components are used only (see [Functional components vs Class components](https://medium.com/@Zwenza/functional-vs-class-components-in-react-231e3fbd7108)). All state is provided via the properties of a component, and these are retrieved by accessing the application state managed by Redux. 

For the login form, there is state inside the component. React-Hooks, or more precisely the [State-hook](https://reactjs.org/docs/hooks-state.html), remove the necessity to write the component as a class component:

```
const LoginForm = ({ login }) => {
  const [username, setUsername] = useState('');
  
  return (
    <input id='username' type='text' value={ username } onChange={ (event) => setUsername(event.target.value) } />
  );
};
```

As the webapplication is written in Javascript + JSX and no typesafety is enforced, I decided to use the [Prop-Types](https://www.npmjs.com/package/prop-types) libray, that allows to describe the format of the properties of a React component. This does not enforce compliance with this specification during compilation time, but raises an exception during runtime, which makes it easy for testing and documentation purposes.

### Tying the components together
As we have seen there are several dependencies between the single components of the project:
* the webapplication depends on the backend service
* the backend service depends on the Redis cache and the MongoDB

To make it easier to test the project during development, I decided to package each component in a Docker container and manage them via docker-compose.
In the docker-compose file the dependencies between the containers are declared and shared configuration is kept, such as access keys for the MongoDB database. This makes local deployment a one-click operation.

```
docker-compose up -build -D
```

The Docker containers are also helpful for production deployment to Heroku dynos: you can run a Docker image on the dynos (and scale each part of the application by scaling the number of dynos). This removes painpoints such as having different library versions installed locally vs in the production runtime.

Environment variables are used to manage the different configuration values in development and production. The only exception is the frontend Docker container: as ReactJS is transpiled and no environment variables can be read after transpiling the application, the URL of the backend service needs to be defined during the build of the Docker image. This is solved by using the [ARG directive in Docker](https://vsupalov.com/docker-arg-env-variable-guide/), that allows injecting values during the build process.

### Future plans
* breaking the backend into smaller microservices:
  * authorization/authentication service
  * sensor value retrieval service
  * potentially more...

Users then would not login via the backend service but the **authoriation service**. The provided token then would be passed to the **sensor retrieval service** which verifies the token by calling the **authorization/authentication service**.

* more access mechanisms for the data:
  * mobile application
  * Alexa/voice integration
  * chatbot integration

* monitoring and alarming functionality:
  * setup alarms for the temperature: too hot/ too cold
  * make the system react on sensor values: temperature is too low -> turn up heating

The final product can be found: https://sensor.hagen-schupp.me
