var utils = require('connect').utils
  , fs = require('fs')
  , path = require('path')
  , join = path.join
  , normalize = path.normalize
  , spawn = require('child_process').spawn
  , cache = {}
  , mtime = {};

module.exports = function externalSass(root, options) {
  options = options || {};

  // root required
  if (!root) throw new Error('externalSass() root path required');
  root = path.normalize(root);

  // sass command
  var sassPath = options.sassPath || '/usr/bin/sass';
  path.exists(sassPath, function(exists) {
    if (!exists) throw new Error('sass command not exists');
  });

  return function(req, res, next) {
    var path = req.url;

    // use cache
    if (options.cache && cache[path]) return send(res, cache[path]);

    // check ext
    if (!/\.(?:scss|sass)$/.test(path)) return next();

    // null byte(s)
    if (~path.indexOf('\0')) return utils.badRequest(res);

    // when root is not given, consider .. malicious
    if (!root && ~path.indexOf('..')) return utils.forbidden(res);

    // join / normalize from optional root dir
    path = normalize(join(root, path));

    // malicious path
    if (root && 0 != path.indexOf(root)) return utils.forbidden(res);

    fs.stat(path, function(err, stat) {
      // ignore ENOENT
      if (err) return 'ENOENT' == err.code ? next() : next(err);

      // directory
      if (stat.isDirectory()) return next();

      // not Modified
      if (mtime[path] && cache[path] && stat.mtime <= mtime[path]) {
        return send(res, cache[path]);
      }

      // exec sass command
      var sass = spawn(sassPath, ['--no-cache', path]);

      sass.stdout.on('data', function(data) {
        var css = data.toString();
        mtime[path] = stat.mtime;
        cache[path] = css;
        send(res, css);
      });

      sass.stderr.on('data', function(err) {
        next(new Error(err));
      });
    });
  }
};

// send css file
function send(res, css) {
  res.writeHead(200, {
    'Content-Type': 'text/css',
    'Content-Length': css.length
  });
  res.end(css);
}
