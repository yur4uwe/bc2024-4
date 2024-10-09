const http = require('http');
const fs = require('fs').promises;
const { program } = require('commander');

program
    .requiredOption('-h, --host <host>', 'host')
    .requiredOption('-p, --port <port>', 'port')
    .requiredOption('-c, --cache <cache>', 'cache directory')
    .parse(process.argv);

const { host, port, cache } = program.opts();

if (!host || !port || !cache) {
    console.error('Please provide all required options');
    process.exit(1);
}

const getImage = (resCode) => `${cache}/${resCode}.jpg`;

const server = http.createServer(async (req, res) => {
    const resCode = req.url.split('/').pop();
    const imagePath = getImage(resCode);
    let body = [];

    req.on('data', chunk => {
        body.push(chunk);
    });

    req.on('end', async () => {
        body = Buffer.concat(body);

        switch (req.method) {
            case 'GET':
                console.log(`GET request for ${resCode}`);
                try {
                    const data = await fs.readFile(imagePath);
                    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                    res.end(data);
                } catch (err) {
                    if (!res.headersSent) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Not Found');
                    }
                }
                break;
            case 'PUT':
                console.log(`PUT request for ${resCode}`);
                try {
                    await fs.writeFile(imagePath, body);
                    if (!res.headersSent) {
                        res.writeHead(201);
                        res.end();
                    }
                } catch (err) {
                    if (!res.headersSent) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error saving the image. err: ' + err);
                    }
                }
                break;
            case 'DELETE':
                console.log(`DELETE request for ${resCode}`);
                try {
                    await fs.unlink(imagePath);
                    if (!res.headersSent) {
                        res.writeHead(200);
                        res.end();
                    }
                } catch (err) {
                    if (!res.headersSent) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Not Found');
                    }
                }
                break;
            default:
                if (!res.headersSent) {
                    res.writeHead(405, { 'Content-Type': 'text/plain' });
                    res.end('Method Not Allowed');
                }
                break;
        }
    });
});

server.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});