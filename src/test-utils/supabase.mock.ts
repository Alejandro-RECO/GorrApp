import { vi } from 'vitest'

export const mockAuth = {
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}

export const mockSupabase = {
  auth: mockAuth,
}

vi.mock('@/shared/lib/supabase', () => ({
  supabase: mockSupabase,
}))
