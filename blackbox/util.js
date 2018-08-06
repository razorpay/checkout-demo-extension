module.exports = {
  delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
  apiUrl: 'http://localhost:3000/api/',
};
