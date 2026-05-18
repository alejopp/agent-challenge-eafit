import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { createUser, getUserByEmail, normalizeUser, getUserById, saveUserCalendarToken, getUserCalendarToken, clearUserCalendarToken, saveUserGmailToken, getUserGmailToken, clearUserGmailToken } from './db.js';
import { signAuthToken } from './auth.js';
import crypto from 'node:crypto';

export function setupOAuth(config) {
  console.log('[OAuth] Config:', {
    googleClientId: config.googleClientId ? 'set' : 'not set',
    googleClientSecret: config.googleClientSecret ? 'set' : 'not set',
    baseUrl: config.baseUrl
  });

  // Google Strategy
  if (config.googleClientId && config.googleClientSecret) {
    console.log('[OAuth] Initializing Google strategy');
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.googleClientId,
          clientSecret: config.googleClientSecret,
          callbackURL: `${config.baseUrl}/api/auth/oauth/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
          console.log('[OAuth] Google callback received, profile:', profile.emails?.[0]?.value);
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              console.log('[OAuth] No email found in profile');
              return done(null, false, { message: 'No email found' });
            }

            let user = getUserByEmail(email);
            console.log('[OAuth] User found:', !!user);
            if (!user) {
              user = createUser({
                id: crypto.randomUUID(),
                displayName: profile.displayName || profile.name?.givenName || email.split('@')[0],
                email: email.toLowerCase(),
                password: crypto.randomBytes(32).toString('hex') // random password for OAuth users
              });
              console.log('[OAuth] New user created:', user.id);
            }

            return done(null, normalizeUser(user));
          } catch (error) {
            console.error('[OAuth] Error in Google strategy:', error);
            return done(error, false);
          }
        }
      )
    );
  }

  // GitHub Strategy
  if (config.githubClientId && config.githubClientSecret) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: config.githubClientId,
          clientSecret: config.githubClientSecret,
          callbackURL: `${config.baseUrl}/api/auth/oauth/github/callback`,
          scope: ['user:email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
            
            let user = getUserByEmail(email);
            if (!user) {
              user = createUser({
                id: crypto.randomUUID(),
                displayName: profile.displayName || profile.username,
                email: email.toLowerCase(),
                password: crypto.randomBytes(32).toString('hex')
              });
            }

            return done(null, normalizeUser(user));
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    try {
      const user = normalizeUser(getUserById(id));
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export function getOAuthRouter(passport, config) {
  const router = new Router();

  const cookieOptions = () => ({
    httpOnly: true,
    sameSite: config.baseUrl.startsWith('https') ? 'lax' : 'lax',
    secure: config.baseUrl.startsWith('https'),
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  // Google routes
  if (config.googleClientId) {
    router.get('/google', (req, res, next) => {
    console.log('[OAuth] Google auth route hit');
    passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account consent'
    })(req, res, next);
});
    
    router.get('/google/callback', 
  (req, res, next) => {
    console.log('[OAuth] Google callback route hit, query:', req.query);
    next();
  },
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login?error=oauth_failed'
  }),
  (req, res) => {
    console.log('[OAuth] Google auth successful, user:', req.user?.id);
    
    const token = signAuthToken(req.user, config.jwtSecret);
    res.cookie('persona_ai_session', token, cookieOptions());
    res.redirect(config.clientDevUrl); 
  }
    );
  }

  // Google Calendar connect/callback/status/disconnect routes
  if (config.googleClientId) {
    router.get('/google-calendar', (req, res) => {
      if (!req.user) return res.redirect(`${config.clientDevUrl}?error=not_authenticated`);
      const returnTo = req.query.returnTo || config.clientDevUrl;
      const state = Buffer.from(JSON.stringify({ userId: req.user.id, returnTo, ts: Date.now() })).toString('base64');
      const params = new URLSearchParams({
        client_id: config.googleClientId,
        redirect_uri: `${config.baseUrl}/api/auth/oauth/google-calendar/callback`,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/calendar',
        access_type: 'offline',
        prompt: 'consent',
        state
      });
      res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    });

    router.get('/google-calendar/callback', async (req, res) => {
      const { code, state, error } = req.query;
      if (error || !code || !state) {
        console.error('[OAuth] Google Calendar callback error:', error);
        return res.redirect(`${config.clientDevUrl}?error=calendar_auth_failed`);
      }
      let userId;
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        userId = decoded.userId;
      } catch {
        return res.redirect(`${config.clientDevUrl}?error=calendar_auth_failed`);
      }
      if (!userId) return res.redirect(`${config.clientDevUrl}?error=calendar_auth_failed`);
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: config.googleClientId,
            client_secret: config.googleClientSecret,
            redirect_uri: `${config.baseUrl}/api/auth/oauth/google-calendar/callback`,
            grant_type: 'authorization_code'
          }).toString()
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;
        saveUserCalendarToken(userId, tokenData.access_token, tokenData.refresh_token || null, expiresAt);
        console.log('[OAuth] Google Calendar token saved for user:', userId);
        let decoded2 = {};
        try { decoded2 = JSON.parse(Buffer.from(state, 'base64').toString('utf-8')); } catch { /* ignore */ }
        const redirectTarget = decoded2.returnTo || config.clientDevUrl;
        const separator = redirectTarget.includes('?') ? '&' : '?';
        res.redirect(`${redirectTarget}${separator}calendar_connected=true`);
      } catch (err) {
        console.error('[OAuth] Google Calendar token exchange error:', err);
        res.redirect(`${config.clientDevUrl}?error=calendar_auth_failed`);
      }
    });

    router.get('/google-calendar/status', (req, res) => {
      if (!req.user) return res.status(401).json({ connected: false });
      const token = getUserCalendarToken(req.user.id);
      res.json({ connected: !!token });
    });

    router.post('/google-calendar/disconnect', (req, res) => {
      if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
      clearUserCalendarToken(req.user.id);
      res.json({ success: true });
    });
  }

  // Google Gmail connect/callback/status/disconnect routes
  if (config.googleClientId) {
    router.get('/google-gmail', (req, res) => {
      if (!req.user) return res.redirect(`${config.clientDevUrl}?error=not_authenticated`);
      const returnTo = req.query.returnTo || config.clientDevUrl;
      const state = Buffer.from(JSON.stringify({ userId: req.user.id, returnTo, ts: Date.now() })).toString('base64');
      const params = new URLSearchParams({
        client_id: config.googleClientId,
        redirect_uri: `${config.baseUrl}/api/auth/oauth/google-gmail/callback`,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/gmail.modify',
        access_type: 'offline',
        prompt: 'consent',
        state
      });
      res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    });

    router.get('/google-gmail/callback', async (req, res) => {
      const { code, state, error } = req.query;
      if (error || !code || !state) {
        console.error('[OAuth] Gmail callback error:', error);
        return res.redirect(`${config.clientDevUrl}?error=gmail_auth_failed`);
      }
      let decoded = {};
      try { decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8')); } catch { /* ignore */ }
      const userId = decoded.userId;
      if (!userId) return res.redirect(`${config.clientDevUrl}?error=gmail_auth_failed`);
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: config.googleClientId,
            client_secret: config.googleClientSecret,
            redirect_uri: `${config.baseUrl}/api/auth/oauth/google-gmail/callback`,
            grant_type: 'authorization_code'
          }).toString()
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;
        saveUserGmailToken(userId, tokenData.access_token, tokenData.refresh_token || null, expiresAt);
        console.log('[OAuth] Gmail token saved for user:', userId);
        const redirectTarget = decoded.returnTo || config.clientDevUrl;
        const separator = redirectTarget.includes('?') ? '&' : '?';
        res.redirect(`${redirectTarget}${separator}gmail_connected=true`);
      } catch (err) {
        console.error('[OAuth] Gmail token exchange error:', err);
        res.redirect(`${config.clientDevUrl}?error=gmail_auth_failed`);
      }
    });

    router.get('/google-gmail/status', (req, res) => {
      if (!req.user) return res.status(401).json({ connected: false });
      const token = getUserGmailToken(req.user.id);
      res.json({ connected: !!token });
    });

    router.post('/google-gmail/disconnect', (req, res) => {
      if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
      clearUserGmailToken(req.user.id);
      res.json({ success: true });
    });
  }

  // GitHub routes
  if (config.githubClientId) {
    router.get('/github', (req, res) => {
      console.log('[OAuth] GitHub auth route hit — forcing account selection');
      const state = crypto.randomUUID();
      res.cookie('github_oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 10 * 60 * 1000 });
      const params = new URLSearchParams({
        client_id: config.githubClientId,
        redirect_uri: `${config.baseUrl}/api/auth/oauth/github/callback`,
        scope: 'user:email',
        state,
        login: ''
      });
      res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
    });

    router.get('/github/callback', async (req, res) => {
      console.log('[OAuth] GitHub callback route hit, query:', req.query);
      const { code, state } = req.query;
      const savedState = req.cookies?.github_oauth_state;

      if (!code || !state || state !== savedState) {
        console.log('[OAuth] GitHub state mismatch or missing code');
        return res.redirect(`${config.clientDevUrl}?error=oauth_failed`);
      }

      try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            client_id: config.githubClientId,
            client_secret: config.githubClientSecret,
            code,
            redirect_uri: `${config.baseUrl}/api/auth/oauth/github/callback`
          })
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

        const userRes = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' }
        });
        const ghUser = await userRes.json();

        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' }
        });
        const emails = await emailsRes.json();
        const primaryEmail = emails.find((e) => e.primary && e.verified)?.email
          || emails[0]?.email
          || `${ghUser.login}@github.com`;

        let user = getUserByEmail(primaryEmail.toLowerCase());
        if (!user) {
          user = createUser({
            id: crypto.randomUUID(),
            displayName: ghUser.name || ghUser.login,
            email: primaryEmail.toLowerCase(),
            password: crypto.randomBytes(32).toString('hex')
          });
        }

        console.log('[OAuth] GitHub auth successful, user:', user.id);
        const token = signAuthToken(normalizeUser(user), config.jwtSecret);
        res.clearCookie('github_oauth_state');
        res.cookie('persona_ai_session', token, cookieOptions());
        res.redirect(config.clientDevUrl);
      } catch (err) {
        console.error('[OAuth] GitHub callback error:', err);
        res.redirect(`${config.clientDevUrl}?error=oauth_failed`);
      }
    });
  }

  return router;
}

