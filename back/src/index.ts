import { serve } from '@hono/node-server'
import app from '../app.js'
import { startWorker, stopWorker } from '../reminder/worker.js'

const port = 4000

// Start the server
const server = serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`🚀 Server is running on http://localhost:${info.port}`)
  
  // Start the reminder worker after server is ready
  startWorker()
})

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received, shutting down gracefully...`)
  
  try {
    // Stop the worker first
    await stopWorker()
    
    // Close the server
    console.log('Closing server...')
    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error)
    process.exit(1)
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

 // Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown('unhandledRejection')
})
