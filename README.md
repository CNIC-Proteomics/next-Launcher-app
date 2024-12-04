# next-Launcher-app

Web application for the next-Launcher system


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

Development mode:
```
PORT=$PORT_APP  REACT_APP_HOST_IP=$HOST_IP  REACT_APP_PORT_CORE=$PORT_CORE  npm start
PORT=3001  REACT_APP_HOST_IP=localhost  REACT_APP_PORT_CORE=8081  npm start
```

## Build the application

Execute the following command to create a production build:
```
NODE_ENV=production npm run build
```
You can set "NODE_ENV" environment variables before running the build command.
