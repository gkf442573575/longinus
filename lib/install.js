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


module.exports = function install({
    success,
    cwd,
    installtype
}) {
    const npm = process.platform === 'win32' ? `${installtype}.cmd` : installtype;
    let params = installtype == 'yarn' ? [] : ['install']
    runCmd({
        cmd: which.sync(npm),
        params,
        success,
        cwd,
    });
};