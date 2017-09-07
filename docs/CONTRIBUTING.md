# Contributing to the project
**Table of Contents**
- [General](#general)
- [Requirements](#requirements)
- [Windows developer issues](#windows-issues)
- [PHP Contributions](#php)
- [JavaScript Contributions](#javascript)
- [CSS Contributions](#css)
- [Icons](#icons)
- [Git Submodules used](#git-submodules)
- [NPM Modules / Dev dependencies](#dev-dependencies)

- - -

## General
Write access to the GitHub repository is restricted, so make a fork and clone that. All work should be done on its own branch, named according to the issue number (*e.g. `42` or `bug/23`*). When you are finished with your work, push your feature branch to your fork, preserving branch name (*not to master*), and create a pull request.

**Always pull from `upstream master` prior to sending pull-requests.**

## Requirements
- [Apache](https://httpd.apache.org/)
- [PHP](https://secure.php.net/)
- [MySQL](https://dev.mysql.com/) or [MariaDB](https://mariadb.org/)
- [Node/NPM](https://nodejs.org/en/)
- [Git](https://www.git-scm.com/download/)

## Windows issues
> This project requires several command line tools which require installation and
some configuration on Windows. The following will need to be added to your `PATH`
in order to be functional. "Git Shell" & "Git Bash" that comes with GitHub Desktop
or Git GUI are fairly usable so long as you select "Use Windows' default console window"
during installation. See [Windows Environment Extension](https://technet.microsoft.com/en-us/library/cc770493.aspx)

- PHP
- Node
- Git
- MySQL
- GPG (GPG4Win)

## Git Hooks
Add these script in `/.git/hooks/` to automate building on pulls and testing on pushes
- `post-merge`
```
#!/bin/sh
git submodule update --init --recursive
npm run build:all
```
- `pre-push` *Causes major delay while tests are running and has issues on GitHub Desktop*
```
#!/bin/sh
export MIN_PHP_VERSION="5.5"
export AUTOLOAD_DIR="classes"
export AUTOLOAD_EXTS=".php"
export AUTOLOAD_FUNC="spl_autoload"
export AUTOLOAD_SCRIPT="./autoloader.php"
export COMPONENTS_DIR="components"
export CONFIG_DIR="config"
npm test
```

You should also copy or rename `.git/hooks/pre-commit.sample` to `.git/hooks.pre-commit`
to ensure that any filenames are valid across all OS's.

## PHP
This project uses PHP's native autoloader [`spl_autoload`](https://secure.php.net/manual/en/function.spl-autoload.php), which is configured via `.travis.yml` and `.htaccess` environment variables. Apache will automatically include the autoloader script using `php_value auto_prepend_file`, but since this uses relative paths, it will only work correctly in the project's root directory. To use in other directories, place a `.htaccess` and set the relative path accordingly.

All pull requests **MUST** pass `php -l` linting, not raise any `E_STRICT` errors
when run, avoid usage or global variables, and not declare any constants or functions
in the global namespaces. All declared constants and functions must be in a file
whose namespace is set according to its path, relative to `DOCUMENT_ROOT`.

## JavaScript
Due to Content-Security-Policy, use of `eval` and inline scripts are **prohibited**. Further, this project uses ECMAScript 2015  [modules](http://exploringjs.com/es6/ch_modules.html), so be sure to familiarize yourself with the syntax.

All JavaScript **MUST** pass Eslint according to the rules defined in `.eslintrc.json`
and have an extension of `.es6`.
Since this project minifies and packages all JavaScript using Babel & Webpack, with
the exception of `custom.es6`, all script **MUST NOT** execute any code, but only
import/export functions, classes, etc.

![JavaScript sample](https://i.imgur.com/Ac0fKZu.png)

## CSS
Like in the above, one of the goals of this project is to keep things working natively, which means standardized CSS and JavaScript. Although the features may be new, `import` and `export` in JavaScript, and `@import` and `--var-name: value` are official standards. In the case of CSS, browser support does exist, and so this project will use `@import` and CSS variables in favor of SASS or LESS.

![CSS sample](https://i.imgur.com/j4sC5qv.png)

## Icons
Wherever possible, all icons are to be created in SVG and minified. PNGs may then be created in whatever size is appropriate. Also, all commonly used icons are to be added to `images/icons.svg` so that they may be used using `<symbol>` and `<use xlink:href/>`.

## NPM
Several useful modules are included for Node users, which is strongly recommended for all development aside from PHP. Simply run `npm install` after download to install all Node modules and Git submodules. There are also several NPM scripts configured, which may be run using `npm run $script`.
- `build:css` which transpiles and minifies CSS
- `build:js` which transpiles and minifies JavaScript
- `build:icons` which creates SVG sprites from `images/icons.json`
- `build:all` which runs all of the above
- `update` which updates Git submodules recursively, installing any new ones
- `test` which runs any configured tests
NPM also has a `postinstall` script which will automatically install and update

## Git submodules
- [shgysk8zer0/core_api](https://github.com/shgysk8zer0/core_api/)
- [shgysk8zer0/core](https://github.com/shgysk8zer0/core/)
- [shgysk8zer0/dom](https://github.com/shgysk8zer0/dom/)
- [shgysk8zer0/std-js](https://github.com/shgysk8zer0/std-js/)
- [shgysk8zer0/core-css](https://github.com/shgysk8zer0/core-css/)
- [shgysk8zer0/fonts](https://github.com/shgysk8zer0/fonts/)
- [shgysk8zer0/svg-icons](https://github.com/shgysk8zer0/svg-icons/)
- [shgysk8zer0/logos](https://github.com/shgysk8zer0/logos/)
- [github/octicons](https://github.com/github/octicons/)
- [necolas/normalize.css](https://github.com/necolas/normalize.css/)

## Dev dependencies
- [Myth](http://www.myth.io/)
- [Babel](https://babeljs.io/)
- [Webpack](https://webpack.github.io/)
- [ESLint](http://eslint.org/)
- [svgo](https://github.com/svg/svgo)
- [svg-sprite-generator](https://github.com/frexy/svg-sprite-generator)
