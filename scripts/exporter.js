#!/usr/local/bin/node

const fs = require('fs')
const path = require('path')

function updateIndex(dir) {
  const files = fs.readdirSync(dir)
  const content = files.filter(v => v !== 'index.js').map(v => `export { default as ${v.replace(/\.js$/, '')} } from './${v}'`).join('\n')

  fs.writeFileSync(`${dir}/index.js`, content)
}

updateIndex(`${__dirname}/../src/containers`)
updateIndex(`${__dirname}/../src/components`)
updateIndex(`${__dirname}/../src/managers`)
updateIndex(`${__dirname}/../src/utils`)
