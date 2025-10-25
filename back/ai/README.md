# Simple Mastra Agent

This is the **simplest possible** Mastra agent setup - just one file!

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add your OpenAI API key:**
   Create a `.env` file in the `server` directory:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key
   ```

3. **Run the agent:**
   ```bash
   npm run agent
   ```

## Files

- **`agent.ts`** - Your complete agent in a single file

## How it works

The agent is created with just 3 properties:
- **Name**: `my-agent` - identifies the agent
- **Instructions**: `You are a helpful assistant.` - the system prompt
- **Model**: `openai('gpt-4o-mini')` - the AI model to use

When you run it, the agent sends a test message and prints the response.

