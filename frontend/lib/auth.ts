export function getRole(): 'admin' | 'sales' | null {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}
