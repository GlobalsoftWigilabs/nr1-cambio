/**
 * Function that generate number randoms
 * @param {Number} length quantity of numbers to generate
 * @return {Array}
 */
function random(length) {
  const random = [];
  for (let index = 0; index < length; index++) {
    const temp = Math.floor(Math.random() * (9999 - 1000)) + 1000;
    if (random.indexOf(temp) === -1) {
      random.push(temp);
    } else {
      index--;
    }
  }
  return random;
}

export { random };
