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

async function getUser(username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function registerUser(id, role, username, password) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Users (id, role, username, password) VALUES (?, ?, ?, ?)',
        [id, role, username, password],
        function (err) {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
}


async function userExists(username) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM Users WHERE username = $username`,
      { $username: username },
      (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows.length > 0);
        }
      }
    );
  }).then((exists) => exists);
}

async function validateLogIn(username, password) {
  const sql = 'SELECT COUNT(*) AS count FROM Users WHERE username = ? AND password = ?';
  const params = [username, password];

  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
      } else {
        const count = row.count || 0;
        const isValid = count > 0;
        resolve(isValid);
      }
    });
  });
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

async function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function getUserByName(username) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM Users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}
printAllUsers()

module.exports = {registerUser, userExists, getPassByUserName, validateLogIn, getAllUsers, getUser, getUserById, getUserByName}




