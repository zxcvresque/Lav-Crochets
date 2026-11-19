import type { Session, User } from "better-auth/types";

declare module "better-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role?: "admin" | "user";
    };
  }
}

declare module "next-auth" {
  interface User {
    role?: "admin" | "user";
  }
}
