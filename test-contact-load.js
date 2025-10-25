#!/usr/bin/env node
/**
 * Load Test Script for Contact API
 * 
 * This script sends multiple concurrent requests to /api/contact
 * to verify that the semaphore limits concurrent Groq API calls to 3.
 * 
 * Usage:
 *   node test-contact-load.js [number-of-requests]
 * 
 * Example:
 *   node test-contact-load.js 10
 */

const https = require('https');

const BASE_URL = process.env.TEST_URL || 'https://sajt-reklama.vercel.app';
const NUM_REQUESTS = parseInt(process.argv[2]) || 10;

console.log(`🚀 Starting load test: ${NUM_REQUESTS} concurrent requests to ${BASE_URL}/api/contact\n`);

const sampleMessages = [
  {
    name: "John Doe",
    email: "john@example.com",
    message: "I'm interested in hiring you for a web development project. Can we discuss pricing?"
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    message: "I'd like to collaborate on a mobile app. Are you available for partnership?"
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    message: "Quick question about your portfolio - what technologies do you use?"
  },
  {
    name: "Alice Williams",
    email: "alice@example.com",
    message: "URGENT: Need a website built ASAP for my startup! Can you help?"
  },
  {
    name: "Charlie Brown",
    email: "charlie@example.com",
    message: "Your work looks amazing! I'd love to work together on my next project."
  },
];

function sendRequest(index) {
  return new Promise((resolve, reject) => {
    const sample = sampleMessages[index % sampleMessages.length];
    const postData = JSON.stringify(sample);

    const url = new URL('/api/contact', BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const startTime = Date.now();
    
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const parsed = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log(`✅ Request ${index + 1}: SUCCESS (${duration}ms) - Intent: ${parsed.analysis?.intent}, Urgency: ${parsed.analysis?.urgency}`);
            resolve({ success: true, duration, data: parsed });
          } else {
            console.log(`❌ Request ${index + 1}: FAILED (${duration}ms) - Status: ${res.statusCode}, Error: ${parsed.error}`);
            resolve({ success: false, duration, error: parsed.error });
          }
        } catch (error) {
          console.log(`⚠️  Request ${index + 1}: PARSE ERROR (${duration}ms) - ${error.message}`);
          resolve({ success: false, duration, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ Request ${index + 1}: NETWORK ERROR (${duration}ms) - ${error.message}`);
      resolve({ success: false, duration, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runLoadTest() {
  const startTime = Date.now();
  
  // Send all requests concurrently
  const promises = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    promises.push(sendRequest(i));
  }

  const results = await Promise.all(promises);
  
  const totalDuration = Date.now() - startTime;
  
  // Calculate statistics
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const maxDuration = Math.max(...results.map(r => r.duration));
  const minDuration = Math.min(...results.map(r => r.duration));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 LOAD TEST RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Requests:    ${NUM_REQUESTS}`);
  console.log(`Successful:        ${successful} (${((successful / NUM_REQUESTS) * 100).toFixed(1)}%)`);
  console.log(`Failed:            ${failed} (${((failed / NUM_REQUESTS) * 100).toFixed(1)}%)`);
  console.log(`Total Time:        ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`Avg Response Time: ${avgDuration.toFixed(0)}ms`);
  console.log(`Min Response Time: ${minDuration}ms`);
  console.log(`Max Response Time: ${maxDuration}ms`);
  console.log(`${'='.repeat(60)}\n`);

  console.log(`ℹ️  Note: With semaphore limit of 3, expect:\n` +
              `   - Max 3 concurrent Groq API calls at any time\n` +
              `   - Slower requests queued (FIFO order)\n` +
              `   - No rate limit errors (429) if working correctly\n`);
}

runLoadTest().catch(console.error);
