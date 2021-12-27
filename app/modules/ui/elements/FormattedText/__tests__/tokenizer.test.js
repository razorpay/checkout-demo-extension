import { tokenizeTextForFormatters } from 'ui/elements/FormattedText/tokenizer';

describe('Module: FormattedText', () => {
  describe('tokenizeTextForFormatters', () => {
    test('Tokenizes the text correctly upto one level of token nesting', () => {
      let textToBeFormatted;

      // -----------------

      textToBeFormatted = 'This <i>might<i> work';

      expect(tokenizeTextForFormatters(textToBeFormatted)).toEqual([
        { text: 'This ', type: 'plain' },
        { text: 'might', type: 'italic' },
        { text: ' work', type: 'plain' },
      ]);

      textToBeFormatted = 'This <b>might<b> work';

      expect(tokenizeTextForFormatters(textToBeFormatted)).toEqual([
        { text: 'This ', type: 'plain' },
        { text: 'might', type: 'bold' },
        { text: ' work', type: 'plain' },
      ]);

      textToBeFormatted = 'This <b>might<b> <i>work<i>';

      expect(tokenizeTextForFormatters(textToBeFormatted)).toEqual([
        { text: 'This ', type: 'plain' },
        { text: 'might', type: 'bold' },
        { text: ' ', type: 'plain' },
        { text: 'work', type: 'italic' },
        { text: '', type: 'plain' },
      ]);

      // -----------------
    });
  });
});
