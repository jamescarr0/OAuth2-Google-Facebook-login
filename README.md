# OAuth2 Login - Facebook & Google.

## Sign Up/Sign In with users facebook & google accounts.

![GitHub Logo](/public/screenshot.png)

Written using the express framework, oauth2.0 & MongoDB.

Users can log into the application using their Facebook or Google accounts.  An account with the users ID (local, facebookId, googleID) and email address is then saved locally.

### Add your google, facebook and session working environment variables to your to .env

\#Google auth
CLIENT_ID=
CLIENT_SECRET=

\#Facebook Auth
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

#Session secret
SESSION_SECRET=

These can be obtained by visiting your developer console/account on facebook & google.
Redirect URI must match the app.get('path') in the Google Authentication section.  In this case, "/auth/google/secrets"

#### Post Secrets Anonymously.

Once logged in, Users are able to post messages anonymously and log out to end the session.
Secrets are persisted to the users account using MongoDB.
