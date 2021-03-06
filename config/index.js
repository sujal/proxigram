config = {
  instagram: {
    client_id: process.env.INSTAGRAM_CLIENT_ID
    , client_secret: process.env.INSTAGRAM_CLIENT_SECRET
  },
  flickr: {
    api_key: process.env.FLICKR_API_KEY
    , api_secret: process.env.FLICKR_API_SECRET
  },
  facebook: {
    app_id: process.env.FACEBOOK_APP_ID
    , app_secret: process.env.FACEBOOK_APP_SECRET
    , app_token: process.env.FACEBOOK_APP_TOKEN
  },
  db: {
    uri: process.env.MONGOHQ_URL || "mongodb://localhost/proxigram_development"
  },
  airbrake: {
    api_key: process.env.AIRBRAKE_API_KEY
  }
}

if (process.env.NODE_ENV == undefined || process.env.NODE_ENV == "development") {
  config.instagram.oauth_callback_url = "http://chromaticlove.dev/auth/instagram/callback";
  config.instagram.connect_oauth_callback_url = "http://chromaticlove.dev/connect/instagram/callback";
  // this needs to be an env var b/c depends on how you can route traffic to your
  // dev box from instagram's servers. For example, i use DynDNS and route specific
  // ports to my dev box.
  config.instagram.realtime_callback_url = process.env.REALTIME_CALLBACK_URL;

  config.flickr.oauth_callback_url = "http://chromaticlove.dev/auth/flickr/callback";
  config.flickr.connect_oauth_callback_url = "http://chromaticlove.dev/connect/flickr/callback";
  config.flickr.push_callback_url = process.env.FLICKR_PUSH_CALLBACK_URL;

  config.facebook.oauth_callback_url = "http://chromaticlove.dev/auth/facebook/callback";
  config.facebook.connect_oauth_callback_url = "http://chromaticlove.dev/connect/facebook/callback";
  config.facebook.push_callback_url = process.env.FACEBOOK_PUSH_CALLBACK_URL;

} else {
  // some other environment
  config.instagram.oauth_callback_url = "https://www.chromaticlove.com/auth/instagram/callback";
  config.instagram.connect_oauth_callback_url = "https://www.chromaticlove.com/connect/instagram/callback";
  config.instagram.realtime_callback_url = process.env.REALTIME_CALLBACK_URL;

  config.flickr.oauth_callback_url = "https://www.chromaticlove.com/auth/flickr/callback";
  config.flickr.connect_oauth_callback_url = "https://www.chromaticlove.com/connect/flickr/callback";
  config.flickr.push_callback_url = process.env.FLICKR_PUSH_CALLBACK_URL;

  config.facebook.oauth_callback_url = "https://www.chromaticlove.com/auth/facebook/callback";
  config.facebook.connect_oauth_callback_url = "https://www.chromaticlove.com/connect/facebook/callback";
  config.facebook.push_callback_url = process.env.FACEBOOK_PUSH_CALLBACK_URL;

}

module.exports = config;
