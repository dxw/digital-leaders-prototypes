const express = require('express')
const nunjucks = require('nunjucks')
const path = require('path')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 3000
const config = require('./app/config.json')

app.set('view engine', 'html')

nunjucks.configure([
  path.join(__dirname, 'app/views'),
  path.join(__dirname, 'node_modules/govuk-frontend/dist')
], {
  autoescape: true,
  express: app
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/assets', express.static(path.join(__dirname, 'app/assets')))
app.use('/govuk/assets', express.static(
  path.join(__dirname, 'node_modules/govuk-frontend/dist/govuk/assets')
))

app.use((req, res, next) => {
  res.locals.serviceName = config.serviceName
  res.locals.assetPath = '/govuk/assets'
  next()
})

app.get('/', (req, res) => {
  res.render('index.html')
})

app.use((req, res, next) => {
  const cleanPath = req.path.replace(/^\/+/, '').replace(/\/+$/, '')

  const possibleViews = [
    `${cleanPath}.html`,
    path.join(cleanPath, 'index.html')
  ]

  const view = possibleViews.find(file =>
    fs.existsSync(path.join(__dirname, 'app/views', file))
  )

  if (!view) return next()

  res.render(view)
})

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`)
})
