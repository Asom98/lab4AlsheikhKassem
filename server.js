const express = require("express")
const app = express()
const cors = require('cors')
app.set('view engine', 'ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config()
const {userExists, registerUser, getPassByUserName, validateLogIn} = require('./database.js')

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())

app.get('/', (req, res)=>{
    res.redirect('/login')
})

app.get('/admin', (req, res)=>{
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

app.listen(5000)