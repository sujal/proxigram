module.exports = function (app) {
  
  // a GET request will be a challenge query
  app.get('/instagram/realtime', function(req, res){
    Instagram.subscriptions.handshake(request, response);
  });
  
  // this is where Instagram will send updates (using POST)
  app.post('/instagram/realtime', function(req, res){
    
  });
  
}