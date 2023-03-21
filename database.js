const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('dbLab4.db');

async function createTable(){
    db.serialize(() => {
        db.run(`
        CREATE TABLE Users (
            id TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )`)
    })    
}

async function addUsers() {
  const users = [
    { id: 'id1', username: 'User1', role: 'student', password: 'password' },
    { id: 'id2', username: 'User2', role: 'student', password: 'password2' },
    { id: 'id3', username: 'User3', role: 'teacher', password: 'password3' },
    { id: 'admin', username: 'Admin', role: 'admin', password: 'admin' }
  ];

  for (const user of users) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Users (id, role, username, password) VALUES (?, ?, ?, ?)',
        [user.id, user.role, user.username, user.password],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

async function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Users', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function printAllUsers() {
  const users = await getAllUsers();
  console.log(users);
}

function deleteUsersTable() {
  db.run('DROP TABLE IF EXISTS Users');
  db.close();
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
printAllUsers()

module.exports = {registerUser, userExists, getPassByUserName, validateLogIn}




