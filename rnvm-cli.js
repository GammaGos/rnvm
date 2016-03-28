#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var PACKAGE_JSON_PATH = function() {
  return path.resolve(
    process.cwd(),
    'package.json'
  );
};
var moduleName = 'react-native';
var rnvmPath;
var react_native_modules;
var prex_node_modules;
var user = '';
function getUser(callback){


  exec('echo $USER', function(e, stdout, stderr) {
    user = stdout;
    user = user.trim();
    rnvmPath = path.join('/Users',user,'rnvm');
    react_native_modules = path.join(rnvmPath, 'react_native_modules');
    prex_node_modules = path.join(rnvmPath, 'prex_node_modules');
    if (!fs.existsSync(rnvmPath)) {
      createRnvmModules(rnvmPath);
    }
    callback(stdout);
  })
}
function createRnvmModules(rnvmPath){

  console.log(rnvmPath);
  fs.mkdirSync(rnvmPath);
  fs.mkdirSync(react_native_modules);

  fs.mkdirSync(prex_node_modules);

  fs.mkdirSync(react_native_modules+'/react-native');
  fs.mkdirSync(prex_node_modules+'/react-native');
}
function main(){
  var args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      'You did not pass any commands, did you mean to run `rnvm use`?'
    );
    process.exit(1);
  }

  switch (args[0]) {
  case 'use':
    if(!user){
      getUser(function(){
          use(args[1]);
      })
    }

    break;
  default:
    console.error(
      'Command `%s` unrecognized. ',
      args[0]
    );
    process.exit(1);
    break;
  }
}

function use(version){


  var oldversion=version;
  if(oldversion){
    var newversion = oldversion.replace('~','').replace('>','').replace('^','');
    var newversionPath = path.join(react_native_modules,'react-native','v'+newversion);
    console.log(newversionPath);
    if (!fs.existsSync(newversionPath)) {
      fs.mkdirSync(newversionPath);

      var execStr = 'cd '+newversionPath+' && npm install --save '+moduleName+'@'+newversion;
      console.log(execStr);
      exec(execStr, function(e, stdout, stderr) {
        if (e) {
          console.log(stdout);
          console.error(stderr);
          console.error('npm install --save '+moduleName+' failed');
          process.exit(1);
        }else {
          console.log('npm install --save '+moduleName+' successed');
          existModule(newversionPath,moduleName);
        }
      });
    }else {
      existModule(newversionPath,moduleName);
    }
  }else {
    var oldversion = require(PACKAGE_JSON_PATH()).dependencies['react-native'];
    var newversion = oldversion.replace('~','').replace('>','');
    use(newversion);
  }
}
function existModule(newversionPath,moduleName){
  var execStr = 'cd '+newversionPath+'/node_modules/'+moduleName+' && npm link && cd '+process.cwd()+' && npm link '
  +moduleName;
  console.log(execStr);
  exec(execStr, function(e, stdout, stderr) {
    if (e) {
      console.log(stdout);
      console.error(stderr);
      console.error('npm link failed');
      process.exit(1);
    }else {
      console.log('npm link successed');
      execInstall();
    }
  });
}
function execInstall(){
  var execStr = 'npm install ';
  console.log(execStr);
  exec(execStr, function(e, stdout, stderr) {
    if (e) {
      console.log(stdout);
      console.error(stderr);
      console.error('npm install failed');
      process.exit(1);
    }else {
      console.log('npm install successed');
    }
  });
}
function checkForVersionArgument() {
  if (process.argv.indexOf('-v') >= 0 || process.argv.indexOf('--version') >= 0) {
    console.log('rnvm: ' + require('./package.json').version);
    process.exit();
  }
}
checkForVersionArgument();

main();
