declare module "next-auth" {
  interface User {
    id: string
    username: string
    role: string
    accountType?: string
    jobRole?: string
    firstName: string
    lastName: string
  }

  interface Session {
    user: {
      id: string
      username: string
      role: string
      accountType?: string
      jobRole?: string
      firstName: string
      lastName: string
      name?: string
      email?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: string
    accountType?: string
    jobRole?: string
    firstName: string
    lastName: string
  }
}
