const express = require('express')
const cors = require('cors')
const mongoose = require("mongoose")
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const messageRoutes = require('./routes/message')
const roomRoutes = require('./routes/roomRoutes')
const { initSocket } = require('./socket/index')

const app = express()
require('dotenv').config()

const corsOptions = {
  origin: process.env.CLIENT_URL
};

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
// app.use('/api/message', messageRoutes)
app.use('/api/room', roomRoutes)

app.get('/', (req, res) => {
  res.send('Hi there!')
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connection Success"))
  .catch((err) => console.log('DB connection Error', err.message))

const server = app.listen(process.env.PORT, () => {
  console.log(`App is listening to port ${process.env.PORT}`)
})

// socket.io
initSocket(server, corsOptions)

module.exports = app;