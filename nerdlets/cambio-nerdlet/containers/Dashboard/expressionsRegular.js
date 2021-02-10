/**
 * Function to separate the query
 *
 * @param {String} ddQuery The query
 * @return {Object}
 */
function qregExrTranslate(ddQuery) {
  const str = ddQuery;
  const re = /(?<functionType>[^(]+)(\((?<function>[^)]+))/;
  const result = str.match(re);
  if (result) {
    return result.groups;
  } else {
    return null;
  }
}

/**
 * Function to take everything that complies with the rule
 *
 * @param {String} functionType The type of function
 * @return {Array}
 */
function qregExrContains(functionType) {
  const str = functionType;
  const regexp = /\w+|\*|\/|-|\+|\}|\{/g;
  const result = str.match(regexp);
  return result;
}

function qregExrQueryValid(validQuery) {
  const str = validQuery;
  const regexp = /\{[a-zA-Z]+:/g;
  const result = str.match(regexp);
  if (result) {
    return result;
  } else {
    return null;
  }
}

function qregExrQueryValidUnion(validQuery) {
  const str = validQuery;
  const regexp = /\{[a-zA-Z]+:+[a-zA-Z0-9-]+\}/g;
  const result = str.match(regexp);
  if (result) {
    return result;
  } else {
    return null;
  }
}

function qregExrQueryValidSignal(validQuery) {
  const str = validQuery;
  const regexp = /\{[a-zA-Z-_]+(:)?[a-zA-Z0-9-,:._]+\}/g;
  const result = str.match(regexp);
  if (result) {
    return result;
  } else {
    return null;
  }
}

/**
 * Function that extract composition of promql through of regex expression
 * @param {*} validQuery
 * @returns
 */
function qregExr(validQuery) {
  const str = validQuery;
  const regexp = /((?<spaceAggregation>\w+):){0,1}(?<metric>[^{]+)\{(?<scope>\*|(?<scopeKey>[^:}]+):(?<scopeValue>[^:}]+)|\$(?<scopeVar>[^:}]+))\}( by \{(?<grouping>\w+)\}){0,1}/;
  const result = str.match(regexp);
  if (result) {
    return result.groups;
  } else {
    return null;
  }
}

export {
  qregExrTranslate,
  qregExrContains,
  qregExrQueryValid,
  qregExrQueryValidUnion,
  qregExrQueryValidSignal,
  qregExr
};
