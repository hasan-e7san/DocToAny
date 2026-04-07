import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      triesUsed: number;
      triesLimit: number;
    } & DefaultSession["user"];
  }
}
