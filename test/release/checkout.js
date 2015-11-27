describe('private vars should not leak:', function(){
  it('track', function(){
  	expect(typeof track).toBe('undefined');
  });
})