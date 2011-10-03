# connect-external-sass

Compiler sass and scss, using external ruby sass command exec.

## Usage

```
var connect = require('connect');
var externalSass = require('connect-external-sass');

connect(
  externalSass(__dirname + '/views', {
    sassPath: '/usr/local/bin/sass',
    cache: true
  })
);
```
