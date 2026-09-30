import "next-auth";
import "next-auth/jwt";

// Auth.js v5: solo se agregan los campos propios; id/name/email/image ya
// vienen en DefaultUser / DefaultSession.
declare module "next-auth" {
  interface User {
    mustChangePassword?: boolean;
  }

  interface Session {
    user: {
      id: string;
      mustChangePassword?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    mustChangePassword?: boolean;
  }
}
