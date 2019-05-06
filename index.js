const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')
const PORT = process.env.PORT || 5000
const api = require('./routes/api')

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use(cors())
  .use(bodyParser.json())
  .use('/api', api)
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  



