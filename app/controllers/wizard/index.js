

exports.step1 = function(req, res){
  if (req.isAuthenticated()) {
    res.redirect('/code');
  } else {
    res.render('step1', { title: 'Step 1: Sign in to Instagram' })
  }
};

exports.step2 = function(req, res){
  res.render('step2', { title: 'Step 2: Grab your JS and Go!' })
};