var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/validationAssessment');
var assessmentCollection = db.get('assessment');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/dashboard', function(req,res,next) {
  res.render('dashboard')
})

router.get('/logout', function(req,res,next) {
  req.session = null;
  res.render('index');
})

router.post('/signin', function(req,res, next){
  var errors = [];
  if(!req.body.user_email.trim()){
    errors.push("Email cannot be empty");
  }
  if(!req.body.user_email.match("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")) {
    errors.push("Email is invalid");
  }
  if(!req.body.user_password.trim()){
    errors.push("Password field cannot be empty");
  }
  assessmentCollection.findOne({email: req.body.user_email}, function(err, data) {
    var hash = bcrypt.hashSync(req.body.user_password, 11);
    if(!data) {
      errors.push("Email is not registered")
    }
    else if(!bcrypt.compareSync(req.body.user_password, hash)) {
      errors.push("Password is incorrect. Hacker Detected. GTFO")
    }
  if(errors.length === 0) {
    req.session.email = req.body.user_email
    email = req.session.email
    res.redirect('dashboard')
  }
  res.render('index', {errors:errors})
  })
})

router.post('/signup', function(req,res,next) {
  var errors = [];
  if(!req.body.user_email.trim()){
    errors.push("Email cannot be empty");
  }
  if(!req.body.user_email.match("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")) {
    errors.push("Email is invalid");
  }
  if(!req.body.user_password.trim()){
    errors.push("Password field cannot be empty");
  }
  // if(!req.body.user_password.length < 4) {
  //   errors.push("Password much be 4 characters long");
  // }
  if(req.body.user_password !== req.body.user_password_confirmation){
    errors.push("Passwords do not match");
  }
  assessmentCollection.findOne({email: req.body.user_email}, function(err, data) {
    if(data) {
      errors.push("Email is already registered")
    }
  if(errors.length === 0) {
    var hash = bcrypt.hashSync(req.body.user_password, 11);
    assessmentCollection.insert({email: req.body.user_email, password:hash}, function(err, data){
    });
    req.session.email = req.body.user_email
    email = req.session.email
    res.redirect('dashboard')
  }
  res.render('index', {errors:errors})
  })
})

router.post('/addstudent', function(req,res,next) {
  var errors = [];
  if(!req.body.student_name.length === 0) {
    errors.push("Student must have a name");
  }
  if(req.body.student_telephone_number.length < 7) {
    errors.push("Not a valid telephone number");
  }
  if(errors.length === 0) {
    assessmentCollection.insert({student:req.body.student_name, telephoneNumber:req.body.student_telephone_number}, function(err, data) {
    });
    res.redirect('show')
  }
  res.render('index', {errors:errors})
})

router.get('/show', function(req,res,next){
  assessmentCollection.find({}, function(err, data) {
  res.render('show', {student: data})    
  })
})

router.get('/:id', function(req,res,next) {
  // console.log("this shit hits")
  assessmentCollection.findOne({_id: req.params.id}, function(err, student) {
    // console.log(student);
    res.render('display', {student:student})
  })
})


module.exports = router;
