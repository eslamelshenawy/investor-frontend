import { SignJWT } from 'jose';

const METABASE_SITE_URL = "https://vague-ledge.metabaseapp.com";
const METABASE_SECRET_KEY = "358a8059cf120c265adab8a11c36d2a6c19fbc7814ea8ff5838dc5fc171258e9";

export const generateMetabaseUrl = async (dashboardId: number): Promise<string> => {
  try {
    const secret = new TextEncoder().encode(METABASE_SECRET_KEY);
    const jwt = await new SignJWT({
      resource: { dashboard: dashboardId },
      params: {},
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setExpirationTime('10m') // 10 minute expiration
      .sign(secret);

    return `${METABASE_SITE_URL}/embed/dashboard/${jwt}#bordered=true&titled=true`;
  } catch (error) {
    console.error("Error generating Metabase URL:", error);
    return "";
  }
};