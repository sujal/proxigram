var ImageList = mongoose.model("ImageList")
    , moment = require('moment')
    , _ = require('underscore')
    , util = require('util');

module.exports = function(app) {
  
  function capitalize(word) {
    word.charAt(0).toUpperCase() + word.slice(1);
  }
  
  function standard_login_response(req, res) {
    if (req.user.needs_verification == true) {
      res.redirect('/step2');        
    } else {
      res.redirect('/code');
    }
  }
  
  function process_connect_request(provider, req, res) {
    var user = req.user;
    var service_token = req.account;
    
    if (service_token.user_id != null)
    {
      // check if the account already has a user that's different from
      // the currently logged in user.
      if (service_token.user_id != user.id)
      {
        req.flash("error", "Could not connect the "+capitalize(provider)+
          " ("+provider+") account. Someone else has already connected to this "+capitalize(provider)+
          " account.");
      } else {
        // the account already exists, check the tokens.
        if (service_token.token != user.tokens[provider].token)
        {
          // update the token
          var temp_service_token = _.clone(service_token);
          delete temp_service_token.user_id;
          user.set("tokens."+provider, temp_service_token);
          user.save(function(err){
            if (err) { throw err; }
            req.flash("success", "Successfully connected <strong>"+service_token.display_name+
                  "</strong> ("+provider+") to your Proxigram account.");
            res.redirect('/code');
          });
        } else {
          // token matches, just return
          req.flash("success", "<strong>"+service_token.display_name+"</strong> ("+provider+
                                        ") already connected to your Proxigram account.");
          res.redirect('/code');
        }
      }
    } else {
      // in this case, the service_token came back WITHOUT a user_id
      // which means its new.
      if (req.user != null) {
        if (user.tokens[provider] != null && user.tokens[provider].token != null && 
              user.tokens[provider].account_id != service_token.account_id) {
          // we have a valid, existing token with a different account... do we overwrite?
          // For now, yes... something to test for when we figure out how to write tests ;-)
          var temp_service_token = _.clone(service_token);
          delete temp_service_token.user_id;
          user.set("tokens."+provider, temp_service_token);
        } else {
          // user didn't have this service or had a blank token (or somehow it was
          // the same token - we won't deal with that case)
          
          // yes this does the same as above - for now.
          var temp_service_token = _.clone(service_token);
          delete temp_service_token.user_id;
          user.set("tokens."+provider, temp_service_token);
        }
        
        user.save(function(err){
          if (err) throw err;
          req.flash("success", "Successfully connected <strong>"+service_token.display_name+
                "</strong> ("+provider+") to your Proxigram account.");
          res.redirect('/code');
        });
      } else {
        // the user should never be null, but in case that happens, yell.
        throw new Error("User was null in a connect callback for "+provider+" - Unexpected scenario.");
      }
    }
  }
  
  app.get('/code', ensureAuthenticated, function(req, res) {
    res.render('users/code', { title: 'Your Dashboard' });
  });
  
  app.get('/users/refresh', ensureAuthenticated, function(req, res) {
    ImageList.instagramPhotosForUser(req.user, {force_refresh: true}, function(err, imageList){
      if (err) {
        req.flash("error", "There was an error refreshing the feed.");
      } else {
        req.flash("info", "Successfully refreshed feed. New timestamp is: " + moment(imageList.updated_at).format('MM/DD/YYYY h:mm:ss a'));        
      }
      res.redirect('/code');      
      });
  });
  
  
  // AUTHENTICATION ROUTES

  // Conventions are as follows:
  // /auth/* routes are used for *creating* accounts and *login*
  // /connect/* routes are used for *adding* connections to existing accounts.
  //            This call requires login to make the connection.
  
  /* INSTAGRAM calls */
  
  app.get('/auth/instagram',
    passport.authenticate('instagram', {successFlash: true, failureFlash: true}),
    function(req, res){
      // The request will be redirected to Twitter for authentication, so this
      // function will not be called.
    });
    
  app.get('/auth/instagram/callback', 
    passport.authenticate('instagram', { failureRedirect: '/step1', successFlash: true, failureFlash: true }),
    standard_login_response
  );

  app.get('/connect/instagram',
    passport.authorize('instagram-connect', {failureRedirect: '/code', successFlash: true, failureFlash: true}),
    function(req, res){
      // The request will be redirected to Twitter for authentication, so this
      // function will not be called.
    });

  app.get('/connect/instagram/callback', 
    passport.authorize('instagram-connect', { failureRedirect: '/code', successFlash: true, failureFlash: true }),
    function(req, res) {
      process_connect_request("instagram", req, res);
    });
  
  app.get('/auth/instagram/disconnect', ensureAuthenticated, function(req, res){
    req.user.disconnect("instagram");
  });

  /* FLICKR calls */
  
  app.get('/auth/flickr',
    passport.authenticate('flickr', {successFlash: true, failureFlash: true}),
    function(req, res){
      // The request will be redirected to Twitter for authentication, so this
      // function will not be called.
    });
    
  app.get('/auth/flickr/callback', 
    passport.authenticate('flickr', { failureRedirect: '/step1', successFlash: true, failureFlash: true }),
    standard_login_response
  );

  app.get('/connect/flickr',
    passport.authorize('flickr-connect', {failureRedirect: '/code', successFlash: true, failureFlash: true}),
    function(req, res){
      // The request will be redirected to Twitter for authentication, so this
      // function will not be called.
    });

  app.get('/connect/flickr/callback', 
    passport.authorize('flickr-connect', { failureRedirect: '/code', successFlash: true, failureFlash: true }),
    function(req, res) {
      process_connect_request("flickr", req, res);
    });
  
  app.get('/auth/flickr/disconnect', ensureAuthenticated, function(req, res){
    req.user.disconnect("flickr");
  });

  /* FACEBOOK calls */
  
  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['user_status', 'user_photos', 'friends_photos'], 
                                 successFlash: true, failureFlash: true }),
    function(req, res){
      // The request will be redirected to Twitter for authentication, so this
      // function will not be called.
    });
    
  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { scope: ['user_status', 'user_photos', 'friends_photos'],
                              failureRedirect: '/step1', 
                                 successFlash: true, failureFlash: true }),
    standard_login_response
  );

  app.get('/connect/facebook',
    passport.authorize('facebook-connect', {scope: ['user_status', 'user_photos', 'friends_photos'], 
                                  failureRedirect: '/code', 
                                     successFlash: true, failureFlash: true}),
    function(req, res){
      // The request will be redirected to Twitter for authentication, so this
      // function will not be called.
    });

  app.get('/connect/facebook/callback', 
    passport.authorize('facebook-connect', { scope: ['user_status', 'user_photos', 'friends_photos'],
                                   failureRedirect: '/code', 
                                      successFlash: true, failureFlash: true }),
    function(req, res) {
      process_connect_request("facebook", req, res);
    });
  
  app.get('/auth/facebook/disconnect', ensureAuthenticated, function(req, res){
    req.user.disconnect("facebook");
  });

  // LOGOUT function
    
  app.get('/logout', function(req, res){
    req.logout();
    req.flash('info', 'You have been successfully logged out.');
    res.redirect('/');
  });
  
  
};
