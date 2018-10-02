#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function updateIndex(dir) {
  const files = fs.readdirSync(dir)
  const content = files
    .filter(v => v !== 'index.js')
    .map(v => `export { default as ${v.replace(/\.js$/, '')} } from './${v}'`)
    .join('\n')

  const entry = path.join(dir, 'index.js')
  fs.writeFileSync(entry, content)
}

const modules = [
  '../src/containers',
  '../src/components',
  '../src/managers',
  '../src/utils',
]

modules.forEach(module => {
  const modulePath = path.join(__dirname, module)
  updateIndex(modulePath)
})
