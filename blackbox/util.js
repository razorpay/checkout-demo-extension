module.exports = {
  delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
  el: {
    isVisible: async $el => {
      const { width, height } = await $el.boundingBox();

      return width && height;
    },
  },
  apiUrl: 'http://localhost:3000/api/',
  assertObject: function (input, expected) {
    const expectedKeys = Object.getOwnPropertyNames(expected);
    for (const key of expectedKeys) {
      if (!input.hasOwnProperty(key)) {
        throw new Error(`"${key}" is missing.`);
      }
    }

    const inputKeys = Object.getOwnPropertyNames(input);
    for (const key of inputKeys) {
      if (!expected.hasOwnProperty(key)) {
        throw new Error(`"${key}" is not required/should not be sent.`);
      }
    }

    return true;
  }
};
