import Anthropic from '@anthropic-ai/sdk';

console.log('Key exists:', !!process.env.ANTHROPIC_API_KEY);

export async function POST(request) {
  try {
    const { role, tasks, elevenPm, desire } = await request.json();

    const systemPrompt = `
  You are Thrive.ai, a workflow intelligence system.
  Redesign the user's work week using the Eliminate / Automate / Own framework.

  ELIMINATE: Tasks that should not exist or belong to someone else.
    For each: write a Handover Protocol.
    Format: { who, steps[], timeline, monitor }
    CRITICAL: The user's 11pm task must appear in Eliminate verbatim.

  AUTOMATE: Tasks where AI produces a reliable first draft for human review.
    For each: write a 3-step Prompt Chain (Step 1, Step 2, Step 3).
    Write a Human Checkpoint: what AI gets wrong + what to look for.

  OWN: Tasks requiring irreplaceable human judgment.
    For each: write an AI Assist Layer:
      what AI preps / what the human does / the handoff moment.
    Write a Human Checkpoint.

  Always frame time savings against the user's desire statement.
  Return JSON only. No prose. No markdown.
  Schema: {
    hoursReclaimed: number,
    desireEcho: string,
    tasks: [{
      name, category, humanMins, aiMins, depth,
      handover?, promptChain?, aiAssist?, checkpoint?, tenX?
    }]
  }`;

    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Role: ${role}. Tasks: ${tasks.join(', ')}. 11pm task: ${elevenPm}. Desired work: ${desire}.`
      }]
    });

    // Strip markdown formatting if Claude wrapped the JSON
    let textStr = response.content[0].text.trim();
    if (textStr.startsWith('```json')) {
      textStr = textStr.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
    } else if (textStr.startsWith('```')) {
      textStr = textStr.replace(/```\n?/, '').replace(/```\n?$/, '').trim();
    }

    const data = JSON.parse(textStr);
    return Response.json(data);
  } catch (error) {
    console.error('API Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
