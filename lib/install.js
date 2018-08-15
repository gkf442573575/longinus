const which = require('which');

function runCmd({
    cmd,
    success,
    cwd,
    params
}) {
    params = params || [];
    const runner = require('child_process').spawn(cmd, params, {
        cwd,
        stdio: 'inherit',
    });
    runner.on('close', function(code) {
        success && success(code);
    });
}

function findNpm(installtype) {
    const npms = process.platform === 'win32' ? ['yarn.cmd', 'tnpm.cmd', 'cnpm.cmd', 'npm.cmd'] : ['yarn', 'tnpm', 'cnpm', 'npm'];
    for (var i = 0; i < npms.length; i++) {
        if (npms[i].indexOf(installtype) > -1) {
            return npms[i];
        }
    }
    throw new Error(`please install ${installtype}`);
}

module.exports = function install({
    success,
    cwd,
    installtype
}) {
    const npm = findNpm(installtype);
    let params = installtype == 'yarn' ? [] : ['install']
    runCmd({
        cmd: which.sync(npm),
        params,
        success,
        cwd,
    });
};