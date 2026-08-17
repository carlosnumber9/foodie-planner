import { createRemoteJWKSet, jwtVerify } from "jose";

import type { IdentityVerifier } from "./app";

export interface AccessIdentityEnvironment {
  APP_ENVIRONMENT?: string;
  LOCAL_USER_SUBJECT?: string;
  TEAM_DOMAIN?: string;
  POLICY_AUD?: string;
}

interface VerifiedToken {
  subject: string;
}

export type AccessTokenVerifier = (
  token: string,
  teamDomain: string,
  audience: string,
) => Promise<VerifiedToken>;

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

async function verifyAccessToken(
  token: string,
  teamDomain: string,
  audience: string,
): Promise<VerifiedToken> {
  const normalizedTeamDomain = teamDomain.replace(/\/$/, "");
  let keySet = keySets.get(normalizedTeamDomain);
  if (keySet === undefined) {
    keySet = createRemoteJWKSet(new URL(`${normalizedTeamDomain}/cdn-cgi/access/certs`));
    keySets.set(normalizedTeamDomain, keySet);
  }

  const { payload } = await jwtVerify(token, keySet, {
    issuer: normalizedTeamDomain,
    audience,
  });
  if (payload.sub === undefined || payload.sub.length === 0) {
    throw new Error("Access assertion has no subject");
  }

  return { subject: payload.sub };
}

export function createAccessIdentityVerifier(
  environment: AccessIdentityEnvironment,
  tokenVerifier: AccessTokenVerifier = verifyAccessToken,
): IdentityVerifier {
  return {
    async verify(request: Request) {
      if (environment.APP_ENVIRONMENT === "development") {
        return environment.LOCAL_USER_SUBJECT === undefined
          ? null
          : { subject: environment.LOCAL_USER_SUBJECT };
      }

      const token = request.headers.get("cf-access-jwt-assertion");
      if (
        token === null ||
        environment.TEAM_DOMAIN === undefined ||
        environment.POLICY_AUD === undefined
      ) {
        return null;
      }

      try {
        return await tokenVerifier(token, environment.TEAM_DOMAIN, environment.POLICY_AUD);
      } catch {
        return null;
      }
    },
  };
}
