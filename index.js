require('dotenv').config();

// ipv4
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
require(path.join(__dirname, 'server', 'server.js'));