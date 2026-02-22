declare module 'passport-google-oauth20' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface VerifyCallback {
    (error: Error | null, user?: unknown, info?: unknown): void;
  }

  export interface Profile {
    id: string;
    displayName?: string;
    name?: {
      familyName?: string;
      givenName?: string;
      middleName?: string;
    };
    emails?: Array<{ value: string; verified?: boolean }>;
    photos?: Array<{ value: string }>;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify?: (...args: unknown[]) => unknown,
    );
  }
}
