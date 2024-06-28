const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

const bodyParser = require('body-parser');

// Connect to MongoDB
mongoose.connect('mongodb+srv://raghuveer:12112002@cluster0.8rtbdi1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


//model db and schema

const userSchema = new mongoose.Schema({
  name:String,
  occupation: String,
  password: String,
});



const User = mongoose.model('User', userSchema)

// Middleware to check if the user is logged in
function checkAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}


//ejs templates
app.set('view engine' , 'ejs')

//middleware
app.use(bodyParser.urlencoded({extended:true}))
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(session({
  secret:"2ab6e5911004d2c70f13c5e517e42ac3d6ed64057248cc464d43c4e38418013b0d2d431b557a0c2f0b1574e24630e5955c6d0f6b313d7a4038bba0a702641435",
  resave: false,
  saveUninitialized: false
}));

app.get('', (req,res)=>{
  res.render('signup')
})


//signup 
app.post('/signup', async (req,res)=>{
  const { name, occupation, password }= req.body;
  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = new User({name, occupation, password:hashedPassword})
  await newUser.save()
  res.redirect('/login')
})

//Login usage

app.get('/login', (req,res)=>{
  res.render('login')
})

app.post('/login', async (req,res)=>{
const { name,password} = req.body;
const user = await User.findOne({name});

if (user && await bcrypt.compare(password, user.password)){
  res.render('home', {user})
}else{
  res.send('Invalid pswrd or username')
}


})

app.get('/home', checkAuth, (req, res) => {
  res.render('home', { user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/home');
    }
    res.redirect('/login');
  });
});
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
