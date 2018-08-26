module.exports = ({ app, env }) => {
  const {
    HOST,
    PORT,
    USERNAME,
    PASSWORD,
    PROJECT_DOMAIN,
    PUBLIC_KEY,
    PRIVATE_KEY,
    SERVER_SECRET
  } = env;

  const SITE_DOMAIN = `${PROJECT_DOMAIN}.glitch.me`;
  const SITE_URL = `https://${SITE_DOMAIN}`;
  const ACTOR_PATH = `/@${USERNAME}`;
  const ACTOR_URL = `${SITE_URL}${ACTOR_PATH}`;
  const ACTOR_KEY_URL = `${ACTOR_URL}#main-key`;

  return {
    app,
    HOST: HOST || SITE_DOMAIN,
    PORT,
    USERNAME,
    PASSWORD,
    PROJECT_DOMAIN,
    PUBLIC_KEY,
    PRIVATE_KEY,
    SERVER_SECRET,
    SITE_DOMAIN,
    SITE_URL,
    ACTOR_PATH,
    ACTOR_URL,
    ACTOR_KEY_URL
  };
};
