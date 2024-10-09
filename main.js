const {program} = require('commander');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const cacheDir = './cache';

fs.mkdir(cacheDir, { recursive: true }).catch(err => console.error(`Error creating cache directory: ${err}`));



const getImage = (resCode) => './cache/' + resCode + '.jpg';

program
    .requiredOption('-h, --host <host>', 'host')
    .requiredOption('-p, --port <port>', 'port')
    .requiredOption('-c, --cache <cache>', 'cache directory')
    .parse(process.argv);

const {host, port, cache} = program.opts();

if(!host || !port || !cache) {
    console.error('Please provide all required options');
    process.exit(1);
}

const server = http.createServer(async (req, res) => {
    const resCode = req.url.split('/').pop();
    const imagePath = getImage(resCode);

    switch (req.method) {
        case 'GET':
            console.log(`GET request for ${resCode}`);
            try {
                const data = await fs.readFile(imagePath);
                res.writeHead(200, { 'Content-Type': 'image/png' });
                res.end(data);
            } catch (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
            break;
        case 'DELETE':
            console.log(`DELETE request for ${resCode}`);
            try {
                await fs.unlink(imagePath);
                res.writeHead(204, { 'Content-Type': 'text/plain' });
                res.end('No Content');
            } catch (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
            break;
        default:
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
            break;
    }

    res.end('');
});


server.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});
