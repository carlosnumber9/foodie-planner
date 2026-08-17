import { describe, expect, it, vi } from "vitest";

import { createAccessIdentityVerifier } from "./access-identity";

describe("Access identity verifier", () => {
  it("uses the explicit local identity only in development", async () => {
    const verifyToken = vi.fn();
    const verifier = createAccessIdentityVerifier(
      { APP_ENVIRONMENT: "development", LOCAL_USER_SUBJECT: "local-user" },
      verifyToken,
    );

    await expect(verifier.verify(new Request("https://example.test/api/foods"))).resolves.toEqual({
      subject: "local-user",
    });
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it("does not enable local identity outside development", async () => {
    const verifier = createAccessIdentityVerifier({ LOCAL_USER_SUBJECT: "local-user" }, vi.fn());

    await expect(verifier.verify(new Request("https://example.test/api/foods"))).resolves.toBeNull();
  });

  it("validates the Access assertion with issuer and audience", async () => {
    const verifyToken = vi.fn().mockResolvedValue({ subject: "access-user" });
    const verifier = createAccessIdentityVerifier(
      {
        TEAM_DOMAIN: "https://team.cloudflareaccess.com",
        POLICY_AUD: "audience-tag",
      },
      verifyToken,
    );
    const request = new Request("https://example.test/api/foods", {
      headers: { "cf-access-jwt-assertion": "signed-token" },
    });

    await expect(verifier.verify(request)).resolves.toEqual({ subject: "access-user" });
    expect(verifyToken).toHaveBeenCalledWith(
      "signed-token",
      "https://team.cloudflareaccess.com",
      "audience-tag",
    );
  });

  it.each([
    { env: {}, token: "signed-token" },
    { env: { TEAM_DOMAIN: "https://team.cloudflareaccess.com", POLICY_AUD: "audience-tag" }, token: null },
  ])("rejects incomplete Access input", async ({ env, token }) => {
    const verifier = createAccessIdentityVerifier(env, vi.fn());
    const headers = token === null ? undefined : { "cf-access-jwt-assertion": token };

    await expect(
      verifier.verify(new Request("https://example.test/api/foods", { headers })),
    ).resolves.toBeNull();
  });

  it("rejects an invalid Access assertion without exposing its error", async () => {
    const verifyToken = vi.fn().mockRejectedValue(new Error("private token detail"));
    const verifier = createAccessIdentityVerifier(
      {
        TEAM_DOMAIN: "https://team.cloudflareaccess.com",
        POLICY_AUD: "audience-tag",
      },
      verifyToken,
    );

    await expect(
      verifier.verify(
        new Request("https://example.test/api/foods", {
          headers: { "cf-access-jwt-assertion": "invalid-token" },
        }),
      ),
    ).resolves.toBeNull();
  });
});
