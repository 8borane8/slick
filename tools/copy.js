const fs = require("fs");

fs.copyFileSync(`${__dirname}/../src/client/dom.html`, `${__dirname}/../dist/client/dom.html`);