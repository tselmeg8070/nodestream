const express = require('express');
const app = express();
const fs = require('fs');
const zlib = require('zlib');
const busboy = require('connect-busboy');
const path = require('path');
const crypto = require('crypto');
const { Transform } = require('stream');

const port = 3000;

app.use(busboy());
app.use(express.static(path.join(__dirname, '')));


app.get('/', (req, res) => res.send('Hello world'))



//Video uploading
app.post('/video/upload', function(req, res) {
	console.log("Video upload is starting");
	req.pipe(req.busboy);
	var fstream;
	req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
            filename = Date.now().toString() + crypto.randomBytes(4).toString('hex') + '.mp4';
            //Path where image will be uploaded
            fstream = fs.createWriteStream('./assets/' + filename);
            file
            //.pipe(zlib.createGzip())
            //.pipe(crypto.createCipher('aes192', 'Bodygram12'))
            .pipe(fstream);
            fstream.on('close', function () {
                console.log("Uploading finished");
                res.json({filename: filename});
            });
        });
});


//Video streaming
app.get('/video/:id/:token', function(req, res) {
	const path = 'assets/' + req.params.id + '.mp4'
	const stat = fs.statSync(path);
	const fileSize = stat.size;
	const range = req.headers.range;
	if(range) {
		const parts = range.replace(/bytes=/, "").split("-");
		const start = parseInt(parts[0], 10);
		const end = parts[1]
			? parseInt(parts[1], 10)
			: fileSize - 1
		const chunkSize = (end - start) + 1;
		const file = fs.createReadStream(path, {start, end})
        //.pipe(crypto.createDecipher('aes192', 'Bodygram12'))
        //.pipe(zlib.createGunzip());
		const head = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunkSize,
			'Content-Type': 'video/mp4',
		};
		res.writeHead(206, head);
		file.pipe(res);
	} else {
		const head = {
			'Content-Length': fileSize,
			'Content-Type': 'video/mp4',
		}
		res.writeHead(200, head);
		fs.createReadStream(path).pipe(res);
	}
	console.log("requesting");	
});

app.listen(port, () => console.log(`App is listening at http://localhost:${port}`))
