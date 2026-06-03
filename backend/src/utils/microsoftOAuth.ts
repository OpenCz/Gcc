const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI!;
const AUTHORITY = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`;

export interface MicrosoftProfile {
  email: string;
  displayName: string;
}

export const microsoftOAuth = {
  getAuthorizeUrl: () => {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: "openid profile email User.Read",
      response_mode: "query",
    });
    return `${AUTHORITY}/oauth2/v2.0/authorize?${params}`;
  },

  exchangeCode: async (code: string): Promise<MicrosoftProfile> => {
    const tokenRes = await fetch(`${AUTHORITY}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok)
      throw new Error("Token exchange failed");
    const { access_token } = await tokenRes.json() as { access_token: string };

    const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {headers: { Authorization: `Bearer ${access_token}` }});
    if (!profileRes.ok)
      throw new Error("Failed to fetch Microsoft profile");
    const raw = await profileRes.json() as {
      mail?: string;
      userPrincipalName?: string;
      displayName?: string;
    };

    const email = (raw.mail ?? raw.userPrincipalName ?? "").toLowerCase();
    if (!email)
      throw new Error("No email in Microsoft profile");

    return { email, displayName: raw.displayName ?? email };
  },
};
