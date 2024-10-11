const WebSocket = require('ws');

// Map to store recruiter WebSocket connections
let wss;
const recruiterConnections = new Map();  // Map { recruiterId: ws }

// Setup WebSocket server and initialize
const setupWebSocket = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        // Assume recruiter ID is passed in query parameter or headers
        const recruiterId = req.headers['recruiter-id'];  // Get recruiter ID from headers (or query string)

        if (recruiterId) {
            recruiterConnections.set(recruiterId, ws);  // Store the connection with recruiter ID as key
        }

        ws.on('message', (message) => {
            console.log(`Received message from recruiter ${recruiterId}: ${message}`);
        });

        ws.on('close', () => {
            console.log(`Recruiter ${recruiterId} WebSocket connection closed.`);
            recruiterConnections.delete(recruiterId);  // Remove connection when recruiter disconnects
        });
    });
};

// Function to notify the specific recruiter
const notifyRecruiter = (recruiterId, message) => {
    const recruiterWs = recruiterConnections.get(recruiterId);  // Get the WebSocket for the recruiter

    if (recruiterWs && recruiterWs.readyState === WebSocket.OPEN) {
        recruiterWs.send(message);  // Send the message only to the recruiter
    } else {
        console.log(`Recruiter ${recruiterId} is not connected or WebSocket is closed.`);
    }
};

// Export the setup and notification function
module.exports = { setupWebSocket, notifyRecruiter };
