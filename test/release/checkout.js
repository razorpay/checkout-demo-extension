describe('private vars should not leak:', function(){
  it('_base', function(){
  	expect(typeof _base).toBe('undefined');
  });
})