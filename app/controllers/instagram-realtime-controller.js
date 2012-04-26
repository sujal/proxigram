module.exports = function (app) {
  
  app.all('/instagram/realtime', function(req, res){
    res.json({result: "success"})
  });
  
}