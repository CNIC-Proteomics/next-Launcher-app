
<!--
### Create a new branch with git and manage branches
	Before creating a new branch, pull the changes from upstream. Your main needs to be up to date.
	$ git pull

	Create the branch on your local machine and switch in this branch :
	$ git checkout -b [name_of_your_new_branch]

	Push the branch on github :
	$ git push origin [name_of_your_new_branch]

### How do I safely merge a Git branch into main?
	git checkout main
	git pull origin main
	git merge develop
	git push origin main  
-->

## Instal npm packages

Go to the *app* folder:
```
cd app
```

Install the npm packages:
```
npm install
```

## Run the web application

Run the web application in a specific PORT:
```
PORT=3001 npm start
```


## Build the application

Execute the following command to create a production build:
```
NODE_ENV=production npm run build
```
You can set "NODE_ENV" environment variables before running the build command.


After building your React application, the build directory contains static files that can be served by any web server.
Here are a few methods to serve your built React application locally and view it in your browser:

- Using `serve` Package

1. Install serve globally:

```
npm install -g serve
```

2. Serve the build directory:

Navigate to your project's root directory and run:

```
serve -s build
```

3. Access the application:

Open your browser and go to http://localhost:3000 (or the port specified by serve)


- Using http-server Package
Another option is to use the http-server package.

1. Install *http-server* globally:

```
npm install http-server
```
2. Serve the build directory:
Navigate to the build directory and run:

```
http-server -p 3000
```
Access the application:

Open your browser and go to http://localhost:3000.
