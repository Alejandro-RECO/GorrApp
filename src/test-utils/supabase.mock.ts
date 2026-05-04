import { vi } from 'vitest'

export const mockAuth = {
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  getUser: vi.fn().mockResolvedValue({
    data: { user: { id: 'test-user-id' } },
    error: null,
  }),
}

// Chainable + thenable Supabase query builder mock
export const mockQueryBuilder: Record<string, ReturnType<typeof vi.fn>> & {
  then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => Promise<unknown>
} = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
  then: (resolve, reject) =>
    Promise.resolve({ data: null, error: null }).then(resolve, reject),
}

mockQueryBuilder.select.mockReturnValue(mockQueryBuilder)
mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder)
mockQueryBuilder.update.mockReturnValue(mockQueryBuilder)
mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder)
mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder)
mockQueryBuilder.gte.mockReturnValue(mockQueryBuilder)
mockQueryBuilder.lte.mockResolvedValue({ data: [], error: null })
mockQueryBuilder.order.mockResolvedValue({ data: [], error: null })
mockQueryBuilder.single.mockResolvedValue({ data: null, error: null })

export const mockSupabase = {
  auth: mockAuth,
  from: vi.fn().mockReturnValue(mockQueryBuilder),
}

vi.mock('@/shared/lib/supabase', () => ({
  supabase: mockSupabase,
}))
