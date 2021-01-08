const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgre',
  port: 5432,
})

pool.query('CREATE TABLE users (id INT,platform varchar(200),last_traded_price varchar(200),fees varchar(200),net_price varchar(200),difference varchar(200),savings varchar(200))', (err, res) => {
    console.log(err, res)
    pool.end()
  })
// pool.query('ALTER TABLE users ADD SERIAL PRIMARY KEY (id)', (err, res) => {
//     console.log(err, res)
//     pool.end()
//   })
// pool.query("INSERT INTO users(platform ,last_traded_price ,fees ,net_price ,difference ,savings)VALUES('WazirX', '₹ 948.50', '₹  1.90 ', '₹ 950.40', '0.92 %', '₹  8.82')", (err, res) => {
//     console.log(err, res)
//     pool.end()
//   })
pool.query("SELECT * from users", (err, res) => {
    console.log(err, res)
    pool.end()
  })