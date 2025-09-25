'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, ShoppingBag, TestTube, Stethoscope, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface SearchResult {
  id: string
  type: string
  title: string
  description: string
  metadata: Record<string, any>
  createdAt: string
  href: string
}

interface SearchComponentProps {
  onSearch?: (results: SearchResult[]) => void
}

export function SearchComponent({ onSearch }: SearchComponentProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchType, setSearchType] = useState('all')

  const searchTypes = [
    { value: 'all', label: 'All' },
    { value: 'orders', label: 'Orders' },
    { value: 'prescriptions', label: 'Prescriptions' },
    { value: 'labs', label: 'Lab Tests' },
    { value: 'appointments', label: 'Appointments' }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return ShoppingBag
      case 'prescription':
        return FileText
      case 'lab_test':
        return TestTube
      case 'appointment':
        return Stethoscope
      default:
        return FileText
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'report_ready':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const performSearch = async () => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        onSearch?.(data.results || [])
      } else {
        console.error('Search failed:', response.statusText)
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, searchType])

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search orders, prescriptions, lab tests, appointments..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
        >
          {searchTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {showResults && (query.length >= 2) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              {loading ? 'Searching...' : `Search Results (${results.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : results.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No results found for "{query}"
              </p>
            ) : (
              <div className="space-y-2">
                {results.map((result) => {
                  const Icon = getIcon(result.type)
                  return (
                    <Link
                      key={result.id}
                      href={result.href}
                      className="block hover:bg-gray-50 p-3 rounded-lg border transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </h4>
                            <Badge className={getStatusColor(result.metadata.status)}>
                              {result.metadata.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{result.type.replace('_', ' ').toUpperCase()}</span>
                            <span>•</span>
                            <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}
