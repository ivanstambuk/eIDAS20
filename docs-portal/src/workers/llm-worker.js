/**
 * LLM Worker - WebLLM inference in a dedicated Web Worker
 * 
 * This worker handles all LLM operations off the main thread:
 * - Model loading with progress updates
 * - Chat completion with streaming
 * - Model unloading
 */

import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm';

// Create the handler that processes messages from the main thread
const handler = new WebWorkerMLCEngineHandler();

// Forward all messages to the handler
self.onmessage = (msg) => {
    handler.onmessage(msg);
};
