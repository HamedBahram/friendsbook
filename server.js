const express = require('express')
const app = express()

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
    const morgan = require('morgan')
    app.use(morgan('dev'))
}

const helmet = require('helmet')
const cors = require('cors')

// routers
const apiRouter = require('./routes/api')
const errorHandler = require('./errors/errorHandler')

// middleware
app.use(express.json())
app.use(helmet())

// file upload
// const multer = require('multer')
// const storage = multer.diskStorage({
//     destination: 'temp/uploads/',
//     filename: function (req, file, cb) {
//         const prefix = Date.now() + '-' + Math.round(Math.random() * 1e9)
//         cb(null, prefix + '-' + file.originalname)
//     },
// })
// const upload = multer({ storage })
// app.post('/upload', upload.single('file'), (req, res) => {
//     console.log(req.body)
//     console.log(req.file)
//     res.json({ message: 'received the request.' })
// })

// routes
app.get('/', (req, res) => res.send('Welcome to Homepage'))
app.use('/api/v1', apiRouter)
app.use(errorHandler)

const { MongoClient } = require('mongodb')
const client = new MongoClient(process.env.MONGODB_URI)
const UserDao = require('./dao/users.dao')
const PostDao = require('./dao/posts.dao')

const PORT = process.env.PORT || 4000

const run = async () => {
    try {
        await client.connect()
        await UserDao.getCollectionHandle(client)
        await PostDao.getCollectionHandle(client)
        app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
    } catch (error) {
        console.dir(error)
    }
}
run()
