import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        const apiUrl = process.env.AI_API_URL;
        if (!apiUrl) {
            return NextResponse.json({ error: 'AI API URL not configured' }, { status: 500 });
        }

        // Get the last few messages for context (max 5)
        const recentMessages = messages.slice(-5).map(m => `${m.senderId === 'me' ? 'User' : 'Other'}: ${m.text}`).join('\n');

        const SYSTEM_PROMPT = `
You are an AI assistant helping a user reply to a chat message.
Based on the recent conversation history, suggest 3 short, relevant, and professional replies that the 'User' might want to send next.
The replies should be concise (max 5-8 words) and diverse (e.g., one affirmative, one inquiry, one gratitude).

Output ONLY a JSON array of strings. Example: ["Yes, that works.", "Can you tell me more?", "Thanks!"]
`;

        const model = process.env.AI_MODEL || 'qwen3-vl:4b';

        // ChatML format
        const finalPrompt = `<|im_start|>system
${SYSTEM_PROMPT}
<|im_end|>
<|im_start|>user
Here is the conversation history:
${recentMessages}

Suggest 3 replies for the 'User'.
<|im_end|>
<|im_start|>assistant
`;

        const payload = {
            model: model,
            prompt: finalPrompt,
            stream: false,
            options: {
                temperature: 0.6
            }
        };

        const externalResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!externalResponse.ok) {
            console.error("External API Error:", externalResponse.status);
            return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
        }

        const data = await externalResponse.json();
        let rawResponse = data.response || "";

        // Parse JSON
        let suggestions = [];
        try {
            const jsonMatch = rawResponse.match(/\[.*\]/s);
            if (jsonMatch) {
                suggestions = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback parsing if JSON is malformed
                suggestions = rawResponse.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
            }
        } catch (e) {
            console.warn("Failed to parse smart reply JSON:", e);
            suggestions = [];
        }

        return NextResponse.json({ suggestions });

    } catch (error) {
        console.error('Error in Smart Reply API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
