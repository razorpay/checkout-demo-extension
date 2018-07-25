module.exports = {
  delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
  el: {
    isVisible: async $el => {
      const { width, height } = await $el.boundingBox();

      return width && height;
    },
  },
};
