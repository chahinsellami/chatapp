#!/usr/bin/env node

/**
 * ============================================================================
 * WebSocket Feature 5 Test Script
 * ============================================================================
 *
 * This script demonstrates and tests the WebSocket real-time features.
 * It:
 * 1. Starts the server
 * 2. Connects multiple WebSocket clients
 * 3. Sends test messages
 * 4. Verifies real-time delivery
 * 5. Tests typing indicators
 *
 * Run with: node test-websocket.js
 * ============================================================================
 */

const WebSocket = require("ws");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  user: (userId, msg) =>
    console.log(`${colors.yellow}👤 [${userId}] ${msg}${colors.reset}`),
};

// ============================================================================
// Test Configuration
// ============================================================================

const SERVER_URL = process.env.WS_URL || "ws://localhost:3000";
const TEST_USERS = ["test-user-1", "test-user-2", "test-user-3"];
const TEST_TIMEOUT = 30000; // 30 seconds max

// ============================================================================
// Test Results Tracking
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    log.success(message);
    testsPassed++;
  } else {
    log.error(message);
    testsFailed++;
  }
}

// ============================================================================
// WebSocket Client Class
// ============================================================================

class TestClient {
  constructor(userId) {
    this.userId = userId;
    this.ws = null;
    this.receivedMessages = [];
    this.receivedEvents = [];
    this.isConnected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      log.user(this.userId, "Connecting to WebSocket server...");

      try {
        this.ws = new WebSocket(SERVER_URL);

        this.ws.on("open", () => {
          log.user(this.userId, "✅ Connected!");
          this.isConnected = true;

          // Register with server
          this.send("register", { userId: this.userId });
          resolve();
        });

        this.ws.on("message", (data) => {
          try {
            const message = JSON.parse(data);
            this.receivedEvents.push(message);
            log.user(this.userId, `Received: ${message.type}`);

            if (message.type === "message") {
              this.receivedMessages.push(message.data);
            }
          } catch (error) {
            log.error(`Failed to parse message: ${error}`);
          }
        });

        this.ws.on("error", (error) => {
          log.error(`WebSocket error: ${error}`);
          reject(error);
        });

        this.ws.on("close", () => {
          log.user(this.userId, "Disconnected from server");
          this.isConnected = false;
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error("Connection timeout"));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  send(type, data = {}) {
    if (!this.isConnected) {
      log.error(`${this.userId}: Not connected, cannot send`);
      return false;
    }

    try {
      this.ws.send(JSON.stringify({ type, ...data }));
      log.user(this.userId, `Sent: ${type}`);
      return true;
    } catch (error) {
      log.error(`${this.userId}: Failed to send: ${error}`);
      return false;
    }
  }

  sendMessage(text, receiverId) {
    return this.send("message", {
      text,
      senderId: this.userId,
      receiverId,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  }

  sendTyping(isTyping) {
    return this.send("typing", { isTyping });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }

  getReceivedCount(type) {
    return this.receivedEvents.filter((e) => e.type === type).length;
  }
}

// ============================================================================
// Test Functions
// ============================================================================

async function runTests() {
  console.log(
    `\n${colors.bright}🚀 WebSocket Feature 5 Test Suite${colors.reset}\n`
  );

  const clients = {};

  try {
    // ========================================================================
    // Test 1: Connection
    // ========================================================================
    log.test("Test 1: Multiple clients connect");
    for (const userId of TEST_USERS) {
      clients[userId] = new TestClient(userId);
      await clients[userId].connect();
    }
    assert(Object.keys(clients).length === 3, "All 3 clients connected");

    // Wait for registration confirmation
    await new Promise((r) => setTimeout(r, 500));

    // ========================================================================
    // Test 2: Broadcast Messages
    // ========================================================================
    log.test("Test 2: Broadcast message delivery");
    const msg1 = {
      text: "Hello from user 1",
      receiverId: TEST_USERS[1],
    };
    clients[TEST_USERS[0]].sendMessage(msg1.text, msg1.receiverId);

    // Wait for broadcast
    await new Promise((r) => setTimeout(r, 1000));

    // Check if other clients received it
    const user1Received = clients[TEST_USERS[1]].receivedMessages.length > 0;
    const user2Received = clients[TEST_USERS[2]].receivedMessages.length > 0;
    assert(
      user1Received,
      `User 2 received message (${
        clients[TEST_USERS[1]].receivedMessages.length
      } messages)`
    );
    assert(
      user2Received,
      `User 3 received message (${
        clients[TEST_USERS[2]].receivedMessages.length
      } messages)`
    );

    // ========================================================================
    // Test 3: Typing Indicators
    // ========================================================================
    log.test("Test 3: Typing indicator broadcast");
    clients[TEST_USERS[0]].sendTyping(true);

    // Wait for broadcast
    await new Promise((r) => setTimeout(r, 500));

    // Check if others received typing update
    const typingUpdates1 =
      clients[TEST_USERS[1]].getReceivedCount("typing-update");
    const typingUpdates2 =
      clients[TEST_USERS[2]].getReceivedCount("typing-update");
    assert(typingUpdates1 > 0, `User 2 received typing update`);
    assert(typingUpdates2 > 0, `User 3 received typing update`);

    // ========================================================================
    // Test 4: Multiple Messages
    // ========================================================================
    log.test("Test 4: Multiple message delivery");
    for (let i = 0; i < 3; i++) {
      clients[TEST_USERS[1]].sendMessage(`Message ${i + 1}`, TEST_USERS[2]);
      await new Promise((r) => setTimeout(r, 100));
    }

    await new Promise((r) => setTimeout(r, 500));

    const totalMessages = clients[TEST_USERS[2]].receivedMessages.length;
    assert(
      totalMessages >= 3,
      `User 3 received at least 3 messages (got ${totalMessages})`
    );

    // ========================================================================
    // Test 5: Connection Status
    // ========================================================================
    log.test("Test 5: Connection status");
    assert(clients[TEST_USERS[0]].isConnected, "User 1 still connected");
    assert(clients[TEST_USERS[1]].isConnected, "User 2 still connected");
    assert(clients[TEST_USERS[2]].isConnected, "User 3 still connected");

    // ========================================================================
    // Summary
    // ========================================================================
    console.log(`\n${colors.bright}📊 Test Results:${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);
    console.log(`Total: ${testsPassed + testsFailed}\n`);

    if (testsFailed === 0) {
      console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
    } else {
      console.log(`${colors.red}⚠️  Some tests failed${colors.reset}\n`);
    }
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  } finally {
    // Cleanup: Close all connections
    for (const client of Object.values(clients)) {
      client.close();
    }

    // Exit with appropriate code
    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

// ============================================================================
// Run Tests
// ============================================================================

console.log(`\n${colors.cyan}🔌 Connecting to: ${SERVER_URL}${colors.reset}\n`);

// Start tests after a small delay (wait for server)
setTimeout(runTests, 1000);

// Timeout if tests take too long
setTimeout(() => {
  log.error("Test suite timeout");
  process.exit(1);
}, TEST_TIMEOUT);
