
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'A simple way to get your Instagram photos' })
};

exports.about = function(req, res){
  res.render("about", { title: 'About Proxigram' })
}