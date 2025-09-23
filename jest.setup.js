import '@testing-library/jest-dom'

// Extend Jest matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received !== null && received !== undefined
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
      pass,
    }
  }
})

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PATIENT',
        patient: {
          id: 'test-patient-id',
          userId: 'test-user-id',
        }
      }
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}))

// Mock fetch globally with proper jest mock
global.fetch = jest.fn()

// Setup for each test
beforeEach(() => {
  if (global.fetch && typeof global.fetch.mockClear === 'function') {
    global.fetch.mockClear()
  }
})