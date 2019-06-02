const express = require('express')

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
  router.use('/login', require('./login.js')())
  router.get('/', (req, res) => {
    res.render('./admin/index.ejs', {})
  })
  router.use('/banners', require('./banners.js')())
  router.use('/custom', require('./custom.js')())
 
  return router
}
