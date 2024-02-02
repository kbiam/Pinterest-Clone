var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postsModel = require('./posts');
const passport = require('passport');
const upload = require('./multer');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/login', function(req, res) {
    res.render('login', { error: req.flash('error') });
  });
  
router.get('/profile',isLoggedIn,async function(req,res){
  const user = await userModel.findOne({
    username:req.session.passport.user
  })
  .populate('posts')
  res.render("profile",{user});
});

router.get('/feed',async function(req,res){
  const posts = await postsModel.find()
  .populate('user');
  console.log(posts);

  res.render('feed',{posts}); 
});
router.post('/upload', isLoggedIn, upload.single('file'), async function(req, res, next) {
    if (!req.file) {
        return res.status(400).send("No Files Were Uploaded.");
    }

    const user = await userModel.findOne({ username: req.user.username });
    const post = await postsModel.create({
        image: req.file.filename,
        user: user._id,
        postText: req.body.caption
    });
    
    user.posts.push(post._id);
    await user.save();
    await console.log(user.posts.populate);// Log information about the created post

    res.redirect("/profile");
});
router.post('/editprofile',isLoggedIn,upload.single('pfp'),async function(req,res,next){
  // if(!req.pfp){
  //   return res.status(400).send("No Files Were Uploaded.");
  // }
  console.log(req.user.username);
  console.log(req.file.filename);

  await userModel.updateOne({ username: req.user.username }, { $set: { dp: req.file.filename } });

  res.redirect('/profile');
});

router.post('/register',function(req,res){
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullName: req.body.fullName
  })
  userModel.register(userData,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");

    })
  })
});

router.post('/login',passport.authenticate("local",{
  successRedirect:'/profile',
  failureRedirect:'/login',
  failureFlash:true
}),function(req,res){
});

router.get('/logout',function(req,res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}






module.exports = router;

