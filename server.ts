// ============================================================================
// Custom Next.js Server with WebSocket Support
// ============================================================================
// This file creates a custom HTTP server that:
// 1. Runs the Next.js application
// 2. Handles WebSocket upgrades for real-time communication
// 3. Initializes the WebSocket server for our chat application
//
// This replaces the default `next dev` with our custom server that has
// WebSocket capabilities.
// ============================================================================

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeWebSocketServer } from './lib/websocket';

// ============================================================================
// Configuration
// ============================================================================

// Port to run the server on
const port = parseInt(process.env.PORT || '3000', 10);

// Check if we're in development mode (true) or production (false)
const dev = process.env.NODE_ENV !== 'production';

// ============================================================================
// Initialize Next.js App
// ============================================================================

// Create Next.js app instance
const app = next({ dev });

// RequestHandler from Next.js
const handle = app.getRequestHandler();

// ============================================================================
// Server Initialization
// ============================================================================

// Wait for Next.js to be ready, then start server
app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url || '', true);

      // Handle all requests with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // =========================================================================
  // WebSocket Upgrade Handler
  // =========================================================================

  server.on('upgrade', (req, socket, head) => {
    // Only upgrade WebSocket requests (ignore other upgrades like HTTP/2)
    if (req.headers.upgrade === 'websocket') {
      console.log('[Server] WebSocket upgrade request received');

      // Get WebSocket server instance and let it handle the upgrade
      const wss = initializeWebSocketServer(server);

      if (wss) {
        // Call the WebSocket server's handleUpgrade method
        // This internally creates a WebSocket instance and calls the 'connection' handler
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      }
    } else {
      // Not a WebSocket upgrade request, close the socket
      socket.destroy();
    }
  });

  // =========================================================================
  // Server Start
  // =========================================================================

  server.listen(port, () => {
    console.log(`\n🚀 Server running with WebSocket support!`);
    console.log(`📱 URL: http://localhost:${port}`);
    console.log(`🔗 WebSocket: ws://localhost:${port}`);
    console.log(`\n✅ Ready to handle real-time messages!\n`);
  });

  // =========================================================================
  // Graceful Shutdown
  // =========================================================================

  // Handle server shutdown (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n\n📛 Shutting down server gracefully...');

    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error('⚠️ Force closing server');
      process.exit(1);
    }, 5000);
  });
});
