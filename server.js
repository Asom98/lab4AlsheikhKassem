const express = require("express")
const app = express()
const cors = require('cors')
app.set('view engine', 'ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config()
const { userExists, registerUser, getPassByUserName, validateLogIn, getAllUsers, getUser, getUserById, getUserByName } = require('./database.js')
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

var currentKey = ""
var currentPassword = ""
var currentUser = ""



app.get('/', (req, res) => {
    res.redirect('/identify')
});

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
});

app.get('/granted', authenticateToken, async (req, res) => {
    console.log(currentUser)
    const user = await getUser(currentUser)
    if (user.username.includes('1')) {
        res.redirect('/student1')
        console.log(user.role)
    } else if (user.username.includes('2')) {
        res.redirect('/student2')
        console.log(user.role)
    } else {
        res.redirect('/teacher')
    }
});

app.get('/register', (req, res) => {
    res.render('register.ejs')
});

app.get('/student1', (req, res) => {
  res.render('student1.ejs');
});

app.get('/student2', (req, res) => {
  res.render('student2.ejs');
});

app.get('/teacher', (req, res) => {
  res.render('teacher.ejs');
});

app.get('/login', (req, res)=>{
    res.render('login.ejs')
})

app.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  const user = await getUserById(id);
  
  if (user) {
    res.send(`Welcome ${user.username}! Your user ID is ${user.id}.`);
  } else {
    res.status(404).send('User not found');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserByName(username);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    res.redirect(`/user/${user.id}`);
  } else {
    res.status(401).send('Incorrect username or password');
  }
});

app.post('/identify', async (req, res) => {

    const { username, password } = req.body
    const token = jwt.sign(password, process.env.TOKEN);
    currentKey = token;
    currentPassword = password;
    currentUser = username
    
    if (!await validateLogIn(username, password)) {
        console.log(`Redirecting to /identify for userName=${username}`);
        res.redirect('/identify');
    } else {
        console.log(`Redirecting to /granted for userName=${username}`);
        res.redirect('/granted')
    }
});

app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const id = 'id' + username;

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
        if (err) throw err;
        try {
            await registerUser(id, role, username, hash);
            console.log('user registered successfully!!');
            res.redirect('/identify');
        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
        });
    });
});

function authenticateToken(req, res, next) {
    if (currentKey == "") {
        res.redirect('/identify')
    } else if (jwt.verify(currentKey, process.env.TOKEN)) {
        next()
    } else { res.redirect('/identify') }
   
};

app.listen(5000)