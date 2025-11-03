'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function OutreachForm({ lpId, messageAngle }: { lpId: string; messageAngle: string | null }) {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState(messageAngle ? `Context: ${messageAngle}\n\n` : '')
  const [channel, setChannel] = useState('email')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lpId, subject, body, channel }),
      })

      if (!response.ok) throw new Error('Failed to create outreach')

      // Reset form
      setSubject('')
      setBody(messageAngle ? `Context: ${messageAngle}\n\n` : '')
      setChannel('email')

      // Refresh page data
      router.refresh()

      alert('Outreach logged successfully!')
    } catch (error) {
      console.error('Error creating outreach:', error)
      alert('Failed to log outreach. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-1">
          Channel
        </label>
        <select
          id="channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="input"
        >
          <option value="email">Email</option>
          <option value="linkedin">LinkedIn</option>
          <option value="phone">Phone</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject (optional)
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input"
          placeholder="Email subject or call topic"
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          Message / Notes
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input"
          rows={6}
          placeholder="Draft your message or add notes about the outreach..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Logging...' : 'Log Outreach'}
      </button>
    </form>
  )
}
