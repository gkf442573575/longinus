const shell = require('shelljs');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const install = require('./install');
const spinner = ora();

function initComplete(app, isInstall) {
  console.log(chalk.green(`Success! Created ${app} project complete!`));
  if (isInstall) {
    console.log(
      chalk.yellow(`begin by typing:

            cd ${app}
            npm run dev
            
            `)
    );
  } else {
    console.log(
      chalk.yellow(`begin by typing:

            cd ${app}
            npm install
            npm run dev
            
            `)
    );
  }
  process.exit();
}

function init(app) {
  let appDir = path.resolve(app);
  if (fs.existsSync(appDir)) {
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'appexist',
          message: `${app} dir exist! Do you want clear this dir?`
        }
      ])
      .then(answer => {
        if (answer.appexist) {
          spinner.start(`clearing ${app} dir`);
          fs.emptyDir(appDir)
            .then(() => {
              spinner.stop();
              createProject(app);
            })
            .catch(err => {
              console.log(chalk.red(err));
              process.exit();
            });
        } else {
          process.exit();
        }
      });
  } else {
    createProject(app);
  }
}

function createProject(app) {
  let initquestions = [
    {
      type: 'input',
      name: 'name',
      message: 'Please input project name',
      default: app,
      validate: name => {
        if (/^[a-zA-Z]+/.test(name)) {
          return true;
        } else {
          return chalk.red('Project name must be English');
        }
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Please input project description'
    },
    {
      type: 'list',
      name: 'templatetype',
      message: 'Please select the project template type to use',
      choices: [
        {
          name: 'gulp-template',
          value: 'gulp'
        },
        {
          name: 'webpack4.0-template',
          value: 'webpack4.0'
        },
        {
          name: 'vue-element-admin',
          value: 'vue-element-admin'
        }
      ]
    }
  ];
  inquirer.prompt(initquestions).then(answer => {
    downloadTemplate(app, answer);
  });
}

function downloadTemplate(app, answer) {
  spinner.start('downloading');
  let templateUrl;
  switch (answer.templatetype) {
    case 'gulp':
      templateUrl = 'gkf442573575/gulpsimple';
      break;
    case 'webpack4.0':
      templateUrl = 'gkf442573575/webpack4.0-simple';
      break;
    case 'vue-element-admin':
        templateUrl = 'PanJiaChen/vue-element-admin'
        break
    default:
      templateUrl = 'gkf442573575/gulpsimple';
      break;
  }
  let appDir = path.resolve(app);
  if (fs.existsSync(appDir)) fs.emptyDirSync(appDir);
  download(templateUrl, appDir, err => {
    spinner.stop();
    if (err) {
      console.log(chalk.red(err));
      process.exit();
      return;
    }
    updateTemplate(app, answer);
  });
}

function updateTemplate(app, answer) {
  let { name, description } = answer;
  let appDir = path.resolve(app);
  fs.readFile(`${appDir}/package.json`, (err, buffer) => {
    if (err) {
      console.log(chalk.red(err));
      process.exit();
      return;
    }
    shell.rm('-f', `${appDir}/.git`);
    shell.rm('-f', `${appDir}/README.md`);
    let packageJson = JSON.parse(buffer);
    Object.assign(packageJson, answer);
    fs.writeFileSync(
      `${appDir}/package.json`,
      JSON.stringify(packageJson, null, 2)
    );

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'installtype',
          message: 'Please select the upgrade method of the project',
          choices: [
            {
              name: 'Use npm',
              value: 'npm'
            },
            {
              name: 'Use cnpm',
              value: 'cnpm'
            },
            {
              name: 'Use yarn',
              value: 'yarn'
            },
            {
              name: 'Install by Myself',
              value: 'myself'
            }
          ]
        }
      ])
      .then(answers => {
        if (answers.installtype == 'myself') {
          initComplete(app, false);
        } else {
          install({
            success: initComplete.bind(null, app, true),
            cwd: appDir,
            installtype: answers.installtype
          });
        }
      });
  });
}

module.exports = init;
