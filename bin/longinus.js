#!/usr/bin/env node

const program = require('commander');
const packageJson = require('../package.json');


program
    .version(packageJson.version)
    .usage('<command> [options]')

program
    .command('init <project-name>','Create a new project powered by longinus')
    .action((name) => {
        require('../lib/init')(name)
    })

program.on('--help', () => {
    console.log('You can browse ' + packageJson.repository.url);

})

program.parse(process.argv)