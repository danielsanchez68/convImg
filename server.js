const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const cors = require('cors')


const storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null, 'uploads')
    },
    filename: function(req,file,cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

const app = express()
app.use(cors())

app.use(express.static('public'))
app.use(express.json())

app.get('/ping', (req,res) => {
    res.send('pong')
})

app.get('/clear', async (req,res) => {
    const { file } = req.query
    await fs.promises.unlink('./public' + file)
    res.redirect('/')
})


app.post('/upload', upload.single('archivo'), async (req,res) => {
    //console.log(req.file)
    const { path, originalname } = req.file

    const file = `./public/conv/${originalname}`

    await sharp(path)
    .resize({ width: 1920 })
    .toFile(file)

    await fs.promises.unlink(path)

    //res.redirect('/')
    res.json({url: file.replace('./public','')})
})


/*  -------------------- SERVIDOR LISTEN ---------------------- */
const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => console.log(`El servidor express está escuchando en http://localhost:${PORT}`))
server.on('error', error => console.log(`Error en servidor: ${error.message}`))
