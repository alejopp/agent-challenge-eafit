import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { createUser, getUserByEmail, normalizeUser, getUserById } from './db.js';
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

  // GitHub routes
  if (config.githubClientId) {
    router.get('/github', passport.authenticate('github'));
    
    router.get('/github/callback',
      passport.authenticate('github', { failureRedirect: '/login?error=oauth_failed' }),
      (req, res) => {
        const token = signAuthToken(req.user, config.jwtSecret);
        res.cookie('persona_ai_session', token, cookieOptions());
        res.redirect('/');
      }
    );
  }

  return router;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}
