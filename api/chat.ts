export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, systemPrompt } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' })
  }

  // Use Thesys C1 API for generative UI, fall back to Groq
  const thesysKey = process.env.THESYS_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  const useThesys = !!thesysKey

  const apiUrl = useThesys
    ? 'https://api.thesys.dev/v1/embed/chat/completions'
    : 'https://api.groq.com/openai/v1/chat/completions'

  const apiKey = useThesys ? thesysKey : groqKey
  const model = useThesys ? 'c1/anthropic/claude-sonnet-4/v-20251230' : 'llama-3.3-70b-versatile'

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const chatMessages = [
    { role: 'system', content: systemPrompt || 'You are Q, an AI assistant.' },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  ]

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`${useThesys ? 'Thesys C1' : 'Groq'} API error:`, response.status, errorText)
      return res.status(response.status).json({ error: `API error: ${response.status}` })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')

    const reader = response.body?.getReader()
    if (!reader) {
      return res.status(500).json({ error: 'No response body' })
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          res.write('data: [DONE]\n\n')
          continue
        }
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`)
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    res.end()
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
