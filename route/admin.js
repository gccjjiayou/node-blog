const express = require('express')
const common = require('../libs/common')
const mysql = require('mysql')

var db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'learn'
})

module.exports = function () {
  var router = express.Router()

  // 检查登录状态
  router.use((req, res, next) => {
    if (!req.session['admin_id'] && req.url != '/login') {  // 没有登录
      res.redirect('/admin/login')
    } else {
      next()
    }
  })
  router.get('/login', (req, res) => {
    res.render('./admin/login.ejs', {})
  })
  router.post('/login', (req, res) => {
    var username = req.body.username
    var password = common.md5(req.body.password + common['MD5_SUFFIX'])
    db.query(`SELECT * FROM admin_table WHERE username='${username}'`, (err, data) => {
      if (err) {
        console.log(err)
        res.status(500).send('database error').end()
      } else {
        if (data.length === 0) {
          res.status(400).send('no this admin').end()
        } else {
          if (data[0].password === password) {
            req.session['admin_id'] = data[0].ID
            res.redirect('/admin')
          } else {
            res.status(400).send('this password is incorrect').end()
          }
        }
      }
    })
  })
  router.get('/', (req, res) => {
    res.render('./admin/index.ejs', {})
  })
  router.get('/banners', (req, res) => {
    switch (req.query.act) {
      case 'mod':
        db.query(`SELECT * FROM banner_table WHERE ID=${req.query.id}`, (err, data) => {
          if (err) {
            console.log(err)
            res.status(500).send('database error').end()
          }
          else if (data[0].length === 0) {
            res.status(404).send('data not found').end()
          }
          else {
            db.query(`SELECT * FROM banner_table`, (err, banners) => {
              if (err) {
                console.log(err)
                res.status(500).send('database error').end()
              } else {
                console.log('data[0]: ', data[0])
                res.render('./admin/banners.ejs', { banners, mod_data: data[0] })
              }
            })
          }
        })
        break
      case 'del':
        db.query(`DELETE FROM banner_table WHERE ID=${req.query.id}`, (err, data) => {
          if (err) {
            console.log(err)
            res.status(500).send('database error').end()
          } else {
            res.redirect('/admin/banners')
          }
        })
        break;
      default:
        db.query(`SELECT * FROM banner_table`, (err, banners) => {
          if (err) {
            console.log(err)
            res.status(500).send('database error').end()
          }
          res.render('./admin/banners.ejs', { banners })
        })

    }

  })
  router.post('/banners', (req, res) => {
    var title = req.body.title
    var description = req.body.description
    var href = req.body.href
    if (!title || !description || !href) {
      res.status(400).send('arg error').end()
    } else {
      if (req.body.mod_id) { // 修改
        db.query(`UPDATE banner_table SET title='${req.body.title}', description='${req.body.description}', href='${req.body.href}' WHERE ID=${req.body.mod_id}`, (err, data) => {
          if (err) {
            console.log(err)
            res.status(500).send('database error').end()
          } else {
            db.query(`INSERT INTO banner_table(title, description, href) VALUE('${title}', '${description}', '${href}')`, (err, data) => {
              if (err) {
                console.log(err)
                res.status(500).send('database error').end()
              } else {
                res.redirect('/admin/banners')
              }
            })
          }
        })
      }
    }
  })
  return router
}
