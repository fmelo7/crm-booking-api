const express = require('express');
const configureLegacyApp = require('./configureLegacyApp');

module.exports = configureLegacyApp(express());
