const express = require("express")
const app = express()
const cors = require('cors')
app.set('view engine', 'ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config()
const { userExists, registerUser, getPassByUserName, validateLogIn, getAllUsers, getUser } = require('./database.js')
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

var currentKey = ""
var currentPassword = ""



app.get('/', (req, res)=>{
    res.redirect('/identify')
})

app.get('/admin', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render('admin', { users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/identify', (req, res) => {
    res.render('identify.ejs')
})

app.get('/granted', authenticateToken, (req, res) => {
    res.render("start.ejs")
})
app.get('/register', (req, res)=>{
    res.render('register.ejs')
})

app.get('/student1', (req, res) => {
  res.render('student1.ejs');
});

app.get('/student2', (req, res) => {
  res.render('student2.ejs');
});

app.get('/teacher', (req, res) => {
  res.render('teacher.ejs');
});

app.post('/identify', async (req, res) => {

    const { username, password } = req.body
    const token = jwt.sign(password, process.env.TOKEN);
    currentKey = token;
    currentPassword = password;
    
    if (!await userExists(username)) {
        console.log(`Redirecting to /identify for userName=${username}`);
        res.redirect('/identify');
    } else {
        console.log(`Redirecting to /granted for userName=${username}`);
        res.redirect('/granted')
    }
    

    /*const username = req.body.userName;
    const password = req.body.password
    const token = jwt.sign(password, process.env.TOKEN);
    currentKey = token;
    currentPassword = password;

    console.log(`Checking userExists for userName=${username}`);
    const exists = await userExists(username);
    console.log(`userExists result for userName=${username}: ${exists}`);

    if (exists) {
        console.log(`Redirecting to /granted for userName=${username}`);
        res.redirect('/granted');
    } else {
        console.log(`Redirecting to /identify for userName=${username}`);
        res.redirect('/identify');
    }*/
});


function authenticateToken(req, res, next) {
    if (currentKey == "") {
        res.redirect('/identify')
    } else if (jwt.verify(currentKey, process.env.TOKEN)) {
        next()
    } else { res.redirect('/identify') }
   
}

app.listen(5000)

/*
app.get('/', (req, res)=>{
    res.redirect('/login')
})



app.get('/login', (req, res)=>{
    res.render('login.ejs')
})

app.get('/register', (req, res)=>{
    res.render('register.ejs')
})

app.post('/login', async(req, res)=>{
    
    const {username, password} = req.body
    const hashPass = await getPassByUserName(username)
    
    if(!await userExists(username)){
        res.render('fail.ejs')
    }else{
        bcrypt.compare(password, hashPass, function(err, isMatch) {
            if (err) throw err;
            if (isMatch && validateLogIn(username, hashPass)) {
                var token = jwt.sign(username, process.env.TOKEN)
                console.log(token)
                res.render('start.ejs')
            } else {
              res.render('fail.ejs')
            }
        });
        
    }
})

app.post('/register', async(req, res)=>{
    
    const {username, password} = req.body

    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(password, salt, function(err, hash){
            if(err) throw err;
            if(registerUser(username,hash)){
                console.log("user registered successfully!!")
                res.redirect('/login')
            }
        })
    })
})
*/