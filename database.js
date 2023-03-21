const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('dbLab3.db');

async function createTable(){
    db.serialize(() => {
        db.run(`
        CREATE TABLE Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )`)
    })    
}

async function registerUser(userName, password){
    const sql = 'INSERT INTO users (username, password) VALUES ($username, $password)'
    const params ={$username: userName, $password: password}

    return new Promise((resolve, reject)=>{
        db.run(sql, params, (error)=>{
            if(error){reject(error)}else{resolve()}
        })
    })
}

async function userExists(username) {
	return new Promise((resolve, reject) => {
		db.all(`SELECT * FROM Users WHERE username = $username `, { $username: username }, (error, rows) => {
			if( error ) reject(error)
			else resolve(rows.length > 0)
		})
	})
}
async function validateLogIn(username, password){
    const sql = 'SELECT * FROM users WHERE username = $username AND password = $password'
    const params = {$username: username, $password: password}

    return new Promise((resolve, reject)=>{
        db.all(sql, params, (error)=>{
            if(error){reject(error)}else{resolve()}
        })
    })
}

async function getPassByUserName(username){
    const sql = 'SELECT password FROM users WHERE username = $username';
    const params = {$username: username}
  
    return new Promise((resolve, reject)=>{
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err)
        } else if (row) {
          resolve(row.password)
        } else {
          resolve(null)
        }
      });
    });
  }

module.exports = {registerUser, userExists, getPassByUserName, validateLogIn}




