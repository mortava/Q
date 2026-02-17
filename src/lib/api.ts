import type { Message } from './store'
import { buildSystemPrompt } from './system-prompt'

export async function streamChat(
  messages: Message[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  const systemPrompt = buildSystemPrompt()

  const apiMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages, systemPrompt }),
      signal,
    })

    if (!response.ok) {
      const err = await response.text()
      onError(`API error: ${response.status} - ${err}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onError('No response body')
      return
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
          onDone()
          return
        }
        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            onChunk(parsed.content)
          }
        } catch {
          // skip malformed
        }
      }
    }

    onDone()
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return
    onError(err instanceof Error ? err.message : 'Unknown error')
  }
}
