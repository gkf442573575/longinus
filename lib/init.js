const fs = require("fs-extra");
const path = require("path");

const shell = require("shelljs");
const inquirer = require("inquirer");
const download = require("download-git-repo");
const ora = require("ora");
const chalk = require("chalk");

const validateName = require("validate-npm-package-name");

const install = require("./install");
const spinner = ora();

const repoList = {
  "vue-element-admin": {
    url: `PanJiaChen/vue-element-admin`,
    desc: "vue-element-admin",
  },
  "vue3-element": {
    url: "gkf442573575/vue3-element-template",
    desc: "vue3-element",
  },
  "electron-vue": {
    url: "gkf442573575/electron-vue-simple",
    desc: "electron-vue",
  },
  "vite-vue3-ts": {
    url: "gkf442573575/vite-vue3-ts",
    desc: "vite-vue3-ts",
  },
  "ng-antd-simple-admin": {
    url: "gkf442573575/ng-simple-admin",
    desc: "ng-antd-simple-admin"
  }
};

function initComplete(app, isInstall) {
  spinner.stop();
  console.log(chalk.green(`🚀  Success! Created ${app} project complete!`));
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

function createProject(app) {
  const allTemplate = Object.keys(repoList).map((key) => {
    return {
      name: repoList[key].desc,
      value: key,
    };
  });
  if (!allTemplate.length) {
    console.error(chalk.red("No Repo Url"));
    process.exit();
    return;
  }

  let initquestions = [
    {
      type: "input",
      name: "description",
      message: "Please input project description",
    },
    {
      type: "list",
      name: "templatetype",
      message: "Please select ",
      choices: allTemplate,
    },
  ];
  inquirer.prompt(initquestions).then((answer) => {
    downloadTemplate(app, answer);
  });
}

function downloadComplete(err) {
  spinner.stop();
  if (err) {
    console.log(chalk.red(err));
    process.exit();
    return;
  }
  updateTemplate(app, answer);
}

function downloadTemplate(app, answer) {
  const { templatetype } = answer;
  const repo = repoList[templatetype];
  const templateUrl = repo.url;
  spinner.start("📦 Downloading...");
  const appDir = path.resolve(process.cwd(), app);
  if (repo.type == "direct") {
    download(`direct:${templateUrl}`, appDir, { clone: true }, (err) => downloadComplete(err));
  } else {
    download(templateUrl, appDir, (err) => downloadComplete(err));
  }
}

function updateProject(app, answer) {
  try {
    const appDir = path.resolve(process.cwd(), app);
    let pkgPath = `${appDir}/package.json`;
    if (fs.existsSync(pkgPath)) {
      let pkg = fs.readFileSync(pkgPath, "utf-8");
      pkg = JSON.parse(pkg);
      pkg = {
        ...pkg,
        name: app,
        description: answer.description,
      };

      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }
    // 移除git文件
    shell.rm("-f", `${appDir}/.git`);
    shell.exec("git init", {
      cwd: appDir,
    });
  } catch (error) {
    console.log(chalk.red(error));
    process.exit();
  }
}

async function updateTemplate(app, answer) {
  const appDir = path.resolve(process.cwd(), app);
  updateProject(app, answer);
  const { installtype } = await inquirer.prompt([
    {
      type: "list",
      name: "installtype",
      message: "Please select the upgrade method of the project",
      choices: [
        {
          name: "Use npm",
          value: "npm",
        },
        {
          name: "Use yarn",
          value: "yarn",
        },
        {
          name: "Install by Myself",
          value: "myself",
        },
      ],
    },
  ]);
  if (installtype == "myself") {
    initComplete(app, false);
  } else {
    install({
      success: initComplete.bind(null, app, true),
      cwd: appDir,
      installtype,
    });
  }
}

async function init(app) {
  const result = validateName(app);
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${app}"`));
    result.errors &&
      result.errors.forEach((err) => {
        console.error(chalk.red.dim("Error: " + err));
      });
    result.warnings &&
      result.warnings.forEach((warn) => {
        console.error(chalk.red.dim("Warning: " + warn));
      });
    process.exit();
  }

  const appDir = path.resolve(process.cwd(), app);

  if (fs.existsSync(appDir)) {
    const { action } = await inquirer.prompt([
      {
        name: "action",
        type: "list",
        message: `${app} dir exist`,
        choices: [
          { name: "Overwrite", value: "overwrite" },
          { name: "Cancel", value: false },
        ],
      },
    ]);
    if (!action) {
      return process.exit();
    }
    if (action === "overwrite") {
      spinner.start(`🧹 Clearing ${app} dir`);
      await fs.remove(appDir);
      spinner.stop();
      createProject(app);
    }
  } else {
    createProject(app);
  }
}

module.exports = init;
