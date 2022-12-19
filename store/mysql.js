const mysql = require('mysql')
const {dbConnect} = require('../config')

let connection;

function handleCon() {
  connection = mysql.createConnection(dbConnect)

  connection.connect((err) => {
    if(err){
      console.error('[db error]', err)
      setTimeout(handleCon, 2000)
    } else {
      console.log('[db] Connected!')
    }
  })

  connection.on('error', err => {
    console.error('[db err]', err)
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleCon()
    } else {
      throw err
    }
  })
}

handleCon()

function list(table) {
  return new Promise((resolve, reject) =>{
    connection.query(`SELECT * FROM ${table}`, (err, data)=>{
      if(err) return reject(err)
      resolve(data)
    })
  })
}


function get(table, id) {
  return new Promise((resolve, reject) =>{
    connection.query(`SELECT * FROM ${table} WHERE id=${id}`, (err, data)=>{
      err && reject(err)
      data.length === 0 && reject('No such user')
      resolve(data)
    })
  })
}

function upsert(table, data, action) {
  switch(action) {
    case 'update':
      return update(table, data)
    default:
      return insert(table, data)
  }
}

function insert(table, data) {
  return new Promise((resolve, reject) =>{
    connection.query(`INSERT INTO ${table} SET ?`, data, (err, result)=>{
      if(err) return reject(err)
      resolve(result)
    })
  })
}

function update(table, data) {
  return new Promise((resolve, reject) =>{
    connection.query(`UPDATE ${table} SET ? WHERE id=?`, [data, data.id], (err, result)=>{
      if(err) return reject(err)
      resolve(result)
    })
  })
}

function query(table, query) {
  return new Promise((resolve, reject)=>{
    connection.query(`SELECT * FROM ${table} WHERE ?`, query, (err, result) =>{
      if(err) return reject(err)
      resolve(result[0] || null)
    })
  })
}

module.exports = {
  list,
  get,
  upsert,
  query,
}