test('bind', function(t) {
  let testFn = td.func();
  let returnVal = String(Math.random());
  td.when(testFn(5, 6)).thenReturn(returnVal);

  let context = {};
  let boundFn = _Func.bind(testFn, context);
  let result = boundFn(5, 6);

  let { callCount, calls } = td.explain(testFn);
  let call = calls[0];

  t.equal(callCount, 1, 'original function should be invoked');
  t.equal(call.context, context, 'with bound context');
  t.same(call.args, [5, 6], 'and passed arguments');
  t.equal(result, returnVal, 'returning original return value');

  t.end();
});
