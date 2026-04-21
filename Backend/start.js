process.env.OPENSSL_CONF = '/dev/null';
process.env.NODE_OPTIONS = '--openssl-legacy-provider';

import('./server.js');