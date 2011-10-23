var NS = {};

NS.Proc = Namespace.Proc;

NS._getSyntax = function(func) {
  var source = func.toString().replace(/\/\/.*/g, '').replace(/\/\*.*?\*\//mg, '');
  if (source.match(/^function\s*\((.*)\)/)) {
    var argName = RegExp.$1;
    var useRe = new RegExp(argName + '\\s*\\.\\s*use\\(.*\\)', 'g');
    var uses = source.match(useRe);
    if (uses) {
      for (var i = 0; i < uses.length; i++) {
        if (uses[i].match(/use\s*\((.+)\)/)) {
          var args = eval('[' + RegExp.$1 + ']');
          if (args.length == 1) {
            uses[i] = args[0];
          }
          else {
            var pkg = args[0];
            var syntax = args[1];
            var methods;
            if (typeof(syntax) == 'string') {
              methods = syntax;
            }
            else if (syntax instanceof Array) {
              methods = syntax.join(',');
            }
            else {
              var temp = [];
              for (var oldname in syntax) {
                temp.push(oldname + '=>' + syntax[oldname]);
              }
              methods = temp.join(',');
            }
            uses[i] = pkg + ' ' + methods;
          }
        }
      }
      return uses;
    }
  }
  return [];
};

NS.define = function(config) {
  var nsDef;
  for (var fqn in config) {
    var syntax = this._getSyntax(config[fqn]);
    nsDef = Namespace(fqn);
    for (var i = 0; i < syntax.length; i++) {
      nsDef.use(syntax[i]);
    }
    nsDef.define(function(ns) {
      ns.use = function(){};
      ns.defun = ns.provide;
      config[fqn](ns);
    });
  }
  return nsDef;
};

NS.run = function(callback) {
  var nsDef = Namespace();
  var syntax = this._getSyntax(callback);
  for (var i = 0; i < syntax.length; i++) {
    nsDef.use(syntax[i]);
  }
  nsDef.apply(function(ns) {
    ns.use = function(){};
    callback(ns);
  });
};
