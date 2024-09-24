const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { setupWebSocket } = require('./utils/websocket'); 

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception 🚨:', err.name, err.message);
    process.exit(1);
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    poolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
}).then(() => console.log('DB connection successful 🚀'));

// Import the Express app
const app = require('./app');

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket using the utility function
setupWebSocket(server);

// Listen on port 5000 or an environment-defined port
const port = 5000 || process.env.PORT;
server.listen(port, () => {
    console.log(`App running on port ${port} 🏃`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection 🚩:', err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
