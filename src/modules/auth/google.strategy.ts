import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Profile, Strategy } from 'passport-google-oauth20';

type GoogleUser = {
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? '',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): GoogleUser {
    const email = profile.emails?.[0]?.value ?? '';
    const givenName = profile.name?.givenName ?? '';
    const familyName = profile.name?.familyName ?? '';
    const picture = profile.photos?.[0]?.value;

    return {
      email,
      name: `${givenName} ${familyName}`.trim(),
      picture,
      accessToken,
    };
  }
}
