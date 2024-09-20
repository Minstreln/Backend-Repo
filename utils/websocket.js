const WebSocket = require('ws');

// WebSocket server instance
let wss;

// Setup WebSocket server and initialize
const setupWebSocket = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket client connected.');

        // Handle incoming messages from client (optional)
        ws.on('message', (message) => {
            console.log(`Received message: ${message}`);
        });

        // Handle client disconnection
        ws.on('close', () => {
            console.log('WebSocket client disconnected.');
        });
    });
};

// Function to send notification to connected clients (like recruiters)
const notifyRecruiter = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message); // Send the notification message
        }
    });
};

// Export the setup and notification function
module.exports = { setupWebSocket, notifyRecruiter };
