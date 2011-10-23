//if(!Date.now) Date.now = function(){ return (new Date).getTime()};
//test('namespace',function(){
//    ok(Namespace,'has Namespace');
//    ok(Namespace('x'),'creation Namespace x');
//    ok(Namespace('x.y'),'creation Namespace x.y');
//    ok(Namespace('x.yy.zzz'),'creation Namespace x.yy.zzz');
//});

test('namespace proc',function(){
  var count = 0;
  NS.run(function(ns){
    var proc = NS.Proc(function($c){
      this["[1]"] = ++count;
      $c();
    }).next(function($c){
      this["[2]"] = ++count;
      $c();
    }).next(function($c){
      this["[3]"] = ++count;
      setTimeout(function(){
        $c();
      },100);
    }).next([
      function($c){
        ++count;
        $c();
      },
      function($c){
        ++count;
        $c();
      },
      NS.Proc(function($c){
        ++count;
        $c();
      }).next(function($c){
        ++count;
        $c();
      })
    ]).next(function($c){
      this["[8]"] = ++count;
      $c();
    });
    ok(proc);
    stop();
    proc.call({},function(state){
      start();
      ok(state);
      equals(state['[1]'],1);
      equals(state['[2]'],2);
      equals(state['[3]'],3);
      equals(state['[8]'],8);
      ok(true);
    });
  });
});

test('self define',function(){
  NS.define({
    'x.y': function(ns){
      equals(ns.CURRENT_NAMESPACE, 'x.y', 'creation Namespace x.y');
      ns.defun({
        exportOne: true,
        exportTwo: false,
        exportObject: function(){}
      });
    }
  });
  NS.define({
    'x.y': function(ns) {
      equals(ns.CURRENT_NAMESPACE,'x.y','creation Namespace x.y');
      equals(ns.exportOne, true, 'export true');
      equals(ns.exportTwo, false, 'export false');
      ok(ns.exportObject,'export Object');
      ns.defun({
        exportThree: function(){}
      });
    }
  });
  NS.run(function(ns) {
    ns.use('x.y *');
    equals(ns.exportOne, true, 'export true');
    equals(ns.exportTwo, false, 'export false');
    ok(ns.exportObject, 'export Object');
  });
  
  var count = 0;
  NS.define({
    'something.utility' : function(ns) {
      ok(true);
      equals(++count, 1);
      ns.defun({
        tuneHtml: function() {}
      });
    }
  });

  NS.define({
    'application.model': function(ns) {
      ns.use('something.utility tuneHtml');
      ok(true);
      equals(++count, 2);
      ns.defun({
        Test1: function(){}
      });
    }
  });
  NS.define({
    'application.model': function(ns) {
      ns.use('something.utility tuneHtml');
      ok(true);
      equals(++count, 3);
      ns.defun({
        Test2: function(){}
      });
    }
  });
  NS.define({
    'application.model': function(ns) {
      ns.use('something.utility tuneHtml');
      ok(true);
      equals(++count, 4);
      ns.defun({
        Test3: function(){}
      });
    }
  });

  NS.run(function(ns) {
    ns.use('application.model');
    ok(true);
    ok(ns.application.model.Test1, 'Test1 available');
    ok(ns.application.model.Test2, 'Test2 available');
    ok(ns.application.model.Test3, 'Test3 available');
  });
});
