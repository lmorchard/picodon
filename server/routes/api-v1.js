const express = require("express");

module.exports = context => {
  const { app, USERNAME, SITE_DOMAIN, ACTOR_URL } = context;

  const apiRouter = express.Router();

  apiRouter.route("/instance").get((request, response) => {
    response.json({
      /*
        "uri": "toot.cafe",
        "title": "Toot Caf\u00e9",
        "description": "Toot Caf\u00e9 is an online club for tooting in a fun, safe, mammoth-themed environment.",
        "email": "nolan@nolanlawson.com",
        "version": "2.4.4",
        "urls": {
          "streaming_api": "wss:\/\/toot.cafe"
        },
        "stats": {
          "user_count": 1898,
          "status_count": 77067,
          "domain_count": 3231
        },
        "thumbnail": "https:\/\/toot.cafe\/system\/site_uploads\/files\/000\/000\/001\/original\/android-chrome-512x512.png",
        "languages": [
          "en"
        ],
        "contact_account": {
          "id": "1",
          "username": "nolan",
          "acct": "nolan",
          "display_name": "Nolan",
          "locked": false,
          "bot": false,
          "created_at": "2017-04-04T07:09:01.624Z",
          "note": "<p>\ud83c\udfba.\u2615 admin, Mastodon contributor, web guy at Microsoft.<br \/>Dev of <a href=\"https:\/\/pinafore.social\" rel=\"nofollow noopener\" target=\"_blank\"><span class=\"invisible\">https:\/\/<\/span><span class=\"\">pinafore.social<\/span><span class=\"invisible\"><\/span><\/a><br \/>Blog: <a href=\"https:\/\/nolanlawson.com\" rel=\"nofollow noopener\" target=\"_blank\"><span class=\"invisible\">https:\/\/<\/span><span class=\"\">nolanlawson.com<\/span><span class=\"invisible\"><\/span><\/a><br \/>Header: <a href=\"https:\/\/flic.kr\/p\/owsn7U\" rel=\"nofollow noopener\" target=\"_blank\"><span class=\"invisible\">https:\/\/<\/span><span class=\"\">flic.kr\/p\/owsn7U<\/span><span class=\"invisible\"><\/span><\/a><br \/>He\/him<\/p>",
          "url": "https:\/\/toot.cafe\/@nolan",
          "avatar": "https:\/\/toot.cafe\/system\/accounts\/avatars\/000\/000\/001\/original\/b7966426bcbd9b08.png",
          "avatar_static": "https:\/\/toot.cafe\/system\/accounts\/avatars\/000\/000\/001\/original\/b7966426bcbd9b08.png",
          "header": "https:\/\/toot.cafe\/system\/accounts\/headers\/000\/000\/001\/original\/84858ff1a4215a50.jpg",
          "header_static": "https:\/\/toot.cafe\/system\/accounts\/headers\/000\/000\/001\/original\/84858ff1a4215a50.jpg",
          "followers_count": 4654,
          "following_count": 434,
          "statuses_count": 7104,
          "emojis": [

          ],
          "fields": [

          ]
        }      
        */
    });
  });

  app.use("/api/v1", apiRouter);

  return { ...context };
};
