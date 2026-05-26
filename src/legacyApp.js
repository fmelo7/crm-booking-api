const express = require('express');
const configureApp = require('./configureApp');

module.exports = configureApp(express());
