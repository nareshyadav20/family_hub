const bcrypt = require('bcrypt');
bcrypt.hash(undefined, 10).then(console.log).catch(console.error);
