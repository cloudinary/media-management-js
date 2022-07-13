#!/bin/bash
set -e;

node_v=$(node --version) ;
npm run lint
npm run test-es6
npm run dtslint


