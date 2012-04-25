config = {
  instagram: {
    client_id = process.env.INSTAGRAM_CLIENT_ID
    , client_secret = process.env.INSTAGRAM_CLIENT_SECRET
  },
  db: {
    uri: process.env.MONGOHQ_URL || "mongodb://localhost/proxigram_development"
  }
}

if (process.env.NODE_ENV == undefined || process.env.NODE_ENV == "development") {
  config.instagram.oauth_callback_url = "http://proxigram.dev/auth/instagram/callback"
} else {
  // some other environment
  config.instagram.oauth_callback_url = "http://proxigram.com/auth/instagram/callback"  
}

module.exports = config;