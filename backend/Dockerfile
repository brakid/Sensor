FROM python:3

ENV PORT=8000
ENV REDIS_URL=redis://:MyRedisPassword@redis:6379/0
ENV SECRET_KEY=<SECRETKEY>
ENV USERNAME=<USERNAME>
ENV PASSWORD_HASH=<PASSWORD-HASH>
ENV MONGODB_URL=mongodb://admin:password@mongodb:27017/admin

WORKDIR /app

EXPOSE $PORT

COPY requirements.txt ./requirements.txt

RUN pip install -r requirements.txt

COPY . ./

CMD [ "uwsgi" , "--lazy", "--ini", "app.ini" ]
