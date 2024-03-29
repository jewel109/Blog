const express = require("express")
const dotenv = require('dotenv')
const db = require("./helpers/db")
const indexRoute = require('./routes/index')
const cors = require("cors")
const app = express()
const logger = require('./helpers/logger/logger')

//logger('we are in ', 'index.js')

dotenv.config({
  path: ".config/dev.env"
})

app.use(cors({
  "Access-Control-Allow-Origin": "*"
}))
db()
app.use(express.json())




app.use('/', indexRoute)

app.use((err, req, res, next) => {
  console.error(`in index.js ${err.stack}`)
  next(err)
})




const port = 9000
app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})

