# connect-external-sass

Compiler sass and scss, using external ruby sass command exec.

## Usage

```
var connect = require('connect');
var extsass = require('connect-external-sass');

connect.createServer()
.use(extsass(__dirname + '/views', { sass: '/usr/local/bin/sass' }));
.listen(3000);
```
