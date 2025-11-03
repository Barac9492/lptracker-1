'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import Link from 'next/link'

type CSVRow = {
  name: string
  contactName?: string
  email?: string
  geo?: string
  strategy?: string
}

export default function UploadPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setResult(null)

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const errors: string[] = []
        let successCount = 0

        for (const [index, row] of results.data.entries()) {
          if (!row.name) {
            errors.push(`Row ${index + 1}: Missing name`)
            continue
          }

          try {
            // Parse strategy field (comma-separated or JSON array)
            let strategy: string[] = []
            if (row.strategy) {
              try {
                strategy = JSON.parse(row.strategy)
              } catch {
                strategy = row.strategy.split(',').map(s => s.trim()).filter(Boolean)
              }
            }

            const response = await fetch('/api/lp/upsert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: row.name,
                contactName: row.contactName,
                email: row.email,
                geo: row.geo,
                strategy,
              }),
            })

            if (!response.ok) {
              const error = await response.text()
              errors.push(`Row ${index + 1} (${row.name}): ${error}`)
            } else {
              successCount++
            }
          } catch (error) {
            errors.push(`Row ${index + 1} (${row.name}): ${error}`)
          }
        }

        setResult({ success: successCount, errors })
        setIsProcessing(false)
      },
      error: (error) => {
        setResult({ success: 0, errors: [`CSV parsing error: ${error.message}`] })
        setIsProcessing(false)
      },
    })

    // Reset file input
    e.target.value = ''
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Upload LP Data</h1>
        <p className="text-gray-600">
          Upload a CSV file to seed or update LP information
        </p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">CSV Format</h2>
        <p className="text-sm text-gray-600 mb-4">
          Your CSV should include the following columns:
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-4 overflow-x-auto">
          <code className="text-sm">
            name,contactName,email,geo,strategy
          </code>
        </div>
        <ul className="text-sm text-gray-600 space-y-2">
          <li><strong>name</strong> (required): LP firm name</li>
          <li><strong>contactName</strong> (optional): Primary contact person</li>
          <li><strong>email</strong> (optional): Contact email</li>
          <li><strong>geo</strong> (optional): Geographic location</li>
          <li><strong>strategy</strong> (optional): Comma-separated or JSON array of strategies</li>
        </ul>

        <div className="mt-4 bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800 font-medium mb-2">Example CSV:</p>
          <pre className="text-xs text-blue-900 overflow-x-auto">
{`name,contactName,email,geo,strategy
Sequoia Capital,Jane Doe,jane@sequoia.com,USA,"Growth,Enterprise"
a16z,John Smith,john@a16z.com,USA,"Early Stage,SaaS"
Index Ventures,Sarah Lee,sarah@index.com,Europe,"B2B,Fintech"`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
        />
        {isProcessing && (
          <p className="mt-4 text-sm text-blue-600">Processing CSV file...</p>
        )}
      </div>

      {result && (
        <div className={`card ${result.errors.length > 0 ? 'border-yellow-300' : 'border-green-300'}`}>
          <h2 className="text-xl font-semibold mb-4">Upload Results</h2>
          <p className="text-sm mb-4">
            <span className="font-semibold text-green-600">{result.success} LPs</span> processed successfully
          </p>
          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-yellow-700 mb-2">
                {result.errors.length} errors:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 max-h-60 overflow-y-auto">
                {result.errors.map((error, i) => (
                  <li key={i} className="text-red-600">• {error}</li>
                ))}
              </ul>
            </div>
          )}
          {result.success > 0 && (
            <Link href="/" className="btn btn-primary mt-4 inline-block">
              View Dashboard
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
