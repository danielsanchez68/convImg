const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')

//https://www.delftstack.com/es/howto/javascript/javascript-download/
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
app.use(express.static('public'))
app.use(express.json())

app.get('/ping', (req,res) => {
    res.send('pong')
})

app.get('/clear', async (req,res) => {
    const { file } = req.query
    await fs.promises.unlink('./public' + file)
    res.json({status: 'ok'})
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

/* ---------------------------------------------------------------------------------- */
/*                                  Glitch update                                     */
/* ---------------------------------------------------------------------------------- */
const crypto = require('crypto');
const { execSync } = require('child_process');

app.post('/git', (req, res) => {
    const hmac = crypto.createHmac('sha1', process.env.SECRET);
    const sig  = 'sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    if (req.headers['x-github-event'] === 'push' &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(req.headers['x-hub-signature']))) {
      res.sendStatus(200);
      const commands = ['git fetch origin master',
                        'git reset --hard origin/master',
                        'git pull origin master --force',
                        'npm install',
                        // your build commands here
                        'refresh']; // fixes glitch ui
      for (const cmd of commands) {
        console.log(execSync(cmd).toString());
      }
      console.log('updated with origin/master!');
      return;
    } else {
      console.log('webhook signature incorrect!');
      return res.sendStatus(403);
    }
  });

/*  -------------------- SERVIDOR LISTEN ---------------------- */
const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => console.log(`El servidor express está escuchando en http://localhost:${PORT}`))
server.on('error', error => console.log(`Error en servidor: ${error.message}`))
