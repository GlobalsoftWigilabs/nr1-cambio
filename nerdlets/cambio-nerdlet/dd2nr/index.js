import { translate } from './transpiler';

/**
 * Function to convert NRQL
 *
 * @param {String} query Consulta de  DataDog
 * @param {String} [typeWidget=null] Tipo de Widget
 * @return {Object}
 */
function convertNrql(query, typeWidget = null) {
  if (typeWidget === 'timeseries') {
    const transpiler = translate(query, null); // queryTranslated getDDTokensMulti2
    transpiler.queryTranslated = [
      transpiler.queryTranslated,
      'TIMESERIES'
    ].join(' ');
    return transpiler;
  } else {
    return translate(query, null);
  }
}

export { convertNrql };
