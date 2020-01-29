cd backend
heroku container:push web -a <backend-project-name>
heroku container:release web -a <backend-project-name>
cd ../frontend
heroku container:push web -a <frontend-project-name>
heroku container:release web -a <frontend-project-name>
heroku open -a <frontend-project-name>