# base image
FROM node:12.2.0-alpine

ARG BACKEND_URL
ENV REACT_APP_BACKEND_URL=${BACKEND_URL:-<BACKEND-URL>}
ENV PORT=5000

EXPOSE $PORT

# set working directory
WORKDIR /app
 
# install and cache app dependencies
COPY package.json ./package.json
RUN npm install --silent
 
COPY . ./
 
RUN npm run build
 
# start app
CMD ["npm", "run", "serve"]
