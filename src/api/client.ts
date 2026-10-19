const BASE_URL = 'https://dummyjson.com'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Only send Content-Type with a body: on GETs it would trigger an extra CORS preflight.
  const headers = init.body ? { 'Content-Type': 'application/json' } : undefined
  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status)
  }
  return (await response.json()) as T
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status >= 500
      ? 'The server is having trouble right now. Please try again in a moment.'
      : error.message
  }
  // fetch() rejects with a TypeError when the network is unreachable.
  if (error instanceof TypeError) return 'Network error. Check your connection and try again.'
  return 'Something went wrong. Please try again.'
}
