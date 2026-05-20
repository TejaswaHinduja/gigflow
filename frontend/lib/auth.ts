
export function getRole(): 'admin' | 'sales' | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('role') as 'admin' | 'sales' | null;
}
