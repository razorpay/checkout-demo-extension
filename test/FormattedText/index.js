import { tokenizeTextForFormatters } from 'ui/elements/FormattedText/tokenizer';

test('Module: FormattedText', t => {
  test('tokenizeTextForFormatters', t => {
    test('Tokenizes the text correctly upto one level of token nesting', t => {
      let textToBeFormatted;

      // -----------------

      textToBeFormatted = 'This __might__ work';

      t.equal(
        JSON.stringify(tokenizeTextForFormatters(textToBeFormatted)),
        '[{"text":"This ","type":"plain"},{"text":"might","type":"italic"},{"text":" work","type":"plain"}]',
        'works for just italic in string'
      );

      textToBeFormatted = 'This **might** work';

      t.equal(
        JSON.stringify(tokenizeTextForFormatters(textToBeFormatted)),
        '[{"text":"This ","type":"plain"},{"text":"might","type":"bold"},{"text":" work","type":"plain"}]',
        'works for just bold in string'
      );

      textToBeFormatted = 'This **might** __work__';

      t.equal(
        JSON.stringify(tokenizeTextForFormatters(textToBeFormatted)),
        '[{"text":"This ","type":"plain"},{"text":"might","type":"bold"},{"text":" ","type":"plain"},{"text":"work","type":"italic"},{"text":"","type":"plain"}]',
        'works for both bold and italic in string'
      );

      // -----------------

      t.end();
    });

    t.end();
  });

  t.end();
});
