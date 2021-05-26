import { getNormalizedAmountFontSize } from 'checkoutframe/components/header';

test('font size normalization', t => {
    let amountString = '₹604454987232343434239342';

    test('Font is normalized without fee bearer and without offer', function(t) {
      t.equal(getNormalizedAmountFontSize(amountString.slice(0, 5), false, false), 24);
      t.equal(getNormalizedAmountFontSize(amountString.slice(0, 12), false, false), 24);
      t.equal(getNormalizedAmountFontSize(amountString.slice(0, 13), false, false), 22.5);
      t.equal(getNormalizedAmountFontSize(amountString, false, false), 17);
      t.end();
    });

    test('Font is normalized with fee bearer and without offer', function(t) {
        t.equal(getNormalizedAmountFontSize(amountString.slice(0, 5), true, false), 24);
        t.equal(getNormalizedAmountFontSize(amountString.slice(0, 10), true, false), 24);
        t.equal(getNormalizedAmountFontSize(amountString.slice(0, 11), true, false), 22.5);
        t.equal(getNormalizedAmountFontSize(amountString, true, false), 17);
        t.end();
    });

    test('Font is normalized without fee bearer and with offer', function(t) {
        t.equal(getNormalizedAmountFontSize(amountString.slice(0, 5), false, true), 24);
        t.equal(getNormalizedAmountFontSize(amountString.slice(0, 7), false, true), 24);
        t.equal(getNormalizedAmountFontSize(amountString.slice(0, 8), false, true), 22.5);
        t.equal(getNormalizedAmountFontSize(amountString, false, true), 17);
        t.end();
    });

    test('Font is normalized with fee bearer and with offer', function(t) {
        t.equal(getNormalizedAmountFontSize(amountString.slice(0, 5), true, true), 24);
        t.equal(getNormalizedAmountFontSize(amountString.slice(0, 6), true, true), 24);
        t.equal(getNormalizedAmountFontSize(amountString.slice(0, 7), true, true), 22.5);
        t.equal(getNormalizedAmountFontSize(amountString, true, true), 17);
        t.end();
    });

    test('Font is normalized when amount is invalid', function(t) {
        t.equal(getNormalizedAmountFontSize('', false, false), 24);
        t.end();
      });
  
    t.end();
  });
  