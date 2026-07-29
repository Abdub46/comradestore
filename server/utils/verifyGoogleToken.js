const axios = require('axios');

// Verifies a Google Sign-In ID token using Google's tokeninfo endpoint.
async function verifyGoogleToken(idToken) {
  if (!idToken) throw new Error('Missing Google credential');

  const { data } = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
    params: { id_token: idToken },
  });

  if (!process.env.GOOGLE_CLIENT_ID || data.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google token was not issued for this app');
  }

  if (!data.email || data.email_verified !== 'true') {
    throw new Error('Google account email is not verified');
  }

  return {
    googleId: data.sub,
    email: data.email,
    firstName: data.given_name || 'Comrade',
    lastName: data.family_name || '',
    avatar: data.picture || undefined,
  };
}

module.exports = verifyGoogleToken;