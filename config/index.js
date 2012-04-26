config = {
  instagram: {
    client_id: process.env.INSTAGRAM_CLIENT_ID
    , client_secret: process.env.INSTAGRAM_CLIENT_SECRET
  },
  db: {
    uri: process.env.MONGOHQ_URL || "mongodb://localhost/proxigram_development"
  },
  airbrake: {
    api_key: process.env.AIRBRAKE_API_KEY
  }
}

if (process.env.NODE_ENV == undefined || process.env.NODE_ENV == "development") {
  config.instagram.oauth_callback_url = "http://proxigram.dev/auth/instagram/callback";
  config.instagram.realtime_callback_url = process.env.REALTIME_CALLBACK_URL;
} else {
  // some other environment
  config.instagram.oauth_callback_url = "http://proxigram.com/auth/instagram/callback"; 
  config.instagram.realtime_callback_url = process.env.REALTIME_CALLBACK_URL;
}

module.exports = config;
