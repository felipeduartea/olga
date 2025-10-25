import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';


const myAgent = new Agent({
  name: 'my-agent',
  instructions: 'You are a helpful assistant.',
  model: openai('gpt-4o-mini'),
});

async function runAgent() {
  try {
    console.log('🤖 Running agent...\n');
    
    const result = await myAgent.generate('Tell me a fun fact about space.');
    
    console.log('Agent response:', result.text);
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

runAgent();
