# Contributing to the project
**Table of Contents**
- [General](#general)
- [Requirements](#requirements)
- [JavaScript Contributions](#javascript)
- [NPM Modules / Dev dependencies](#dev-dependencies)
- - -
## General
Write access to the GitHub repository is restricted, so make a fork and clone that.
All work should be done on its own branch, named according to the issue number
(*e.g. `42` or `bug/23`*). When you are finished with your work, push your feature
branch to your fork, preserving branch name (*not to master*),
and create a pull request.

**Always pull from `upstream master` prior to sending pull-requests.**

Web extensions documentation may be found on [MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions).

In order for any pull request to be merged into master, it **MUST** pass `npm test`.
When you open a pull request, you will see its status reported. If your branch is
behind master, you may have the ability to update it from there.

![checks not completed](https://i.imgur.com/Y4r16I9.png)

![checks passed](https://i.imgur.com/9gmNwhQ.png)

## Requirements
- [Firefox](https://www.mozilla.org/en-US/firefox/)
- [Node.js/NPM](https://nodejs.org/en/)
- [Git](https://www.git-scm.com/download/)

## JavaScript
The use of `eval` and inline scripts are **prohibited**.

All JavaScript **MUST** pass Eslint according to the rules defined in `.eslintrc`
and have an extension of `.js`.

## NPM
Several useful modules are included for Node users, which is strongly recommended
for all development. Simply run `npm install` after download to install all Node
modules and Git submodules. There are also several NPM scripts configured, which
may be run using `npm run $script`.

- `npm run build` Which packages the extension as an unsigned zip file in `web-ext-artifacts/`
- `npm test` which runs any configured tests (`eslint`, `stylelint`, `web-ext lint`)
- `npm start` which opens Firefox with a clean profile for testing purposes

## Dev dependencies
- [ESLint](http://eslint.org/)
- [stylelint](https://stylelint.io/)
- [web-ext](https://www.npmjs.com/package/web-ext)
