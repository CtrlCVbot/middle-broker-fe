import { type DefaultSession } from 'next-auth';
import { type SystemAccessLevel } from './user';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      system_access_level: SystemAccessLevel;
      domains: string[];
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    system_access_level: SystemAccessLevel;
    domains: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    system_access_level: SystemAccessLevel;
    domains: string[];
  }
} 