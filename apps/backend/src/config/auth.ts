import { config } from './index';

export const authConfig = {
  github: {
    clientId: config.github.clientId,
    clientSecret: config.github.clientSecret,
    callbackUrl: config.github.callbackUrl,
  },
  jwt: {
    secret: config.session.jwtSecret,
  },
};
