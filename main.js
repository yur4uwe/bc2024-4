const {program} = require('commander');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    fs.writeFile(path.join(cache, 'log.txt'), `${new Date().toISOString()} - ${req.url}\n`, { flag: 'a' });
    res.end('Hello World\n');
});

server.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});
