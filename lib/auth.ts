
// Utility for auth, but since using NextAuth, perhaps empty or helpers
export const getUserRole = (session: any) => session?.user?.role;