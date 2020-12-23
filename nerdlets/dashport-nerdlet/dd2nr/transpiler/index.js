import {
  qregExrTranslate,
  qregExrContains,
  qregExrQueryValidSignal,
  qregExr
} from './regexr';
import { random } from './random';
import { CONVERT_FUNCTIONS_MAP } from './constants/functionsMap';
import {
  AGGREGATION_MAP,
  METRIC_MAP,
  ATTRIBUTE_MAP,
  SPECIAL_TYPES_MAP
} from './constants/maps';

/**
 * Traduce de dd_query a nrql
 *
 * @param {*} ddQuery The query
 * @param {*} [functionType=null] Function Type
 */
function translate(query, functionType = null) {
  const aggregationTokens = {};
  const getFunction = getFunctions(query); // query, functionsTokens
  if (functionType) {
    aggregationTokens.functionType = functionType;
    getFunction.functionsTokens = aggregationTokens;
  }
  const getDDTokensMulti2 = getDDTokensMulti(
    getFunction.query,
    getFunction.functionsTokens
  ); // queryTranslated, varValues
  if (getDDTokensMulti2.queryTranslated.includes('undefined')) {
    return {
      queryTranslated: null,
      getDDTokensMulti2: getDDTokensMulti2.varValues
    };
  } else {
    return {
      queryTranslated: getDDTokensMulti2.queryTranslated,
      getDDTokensMulti2: getDDTokensMulti2.varValues
    };
  }
}

/**
 * Filter to know if they have the form of a function and its type, if not, return the same query
 *
 * @param {*} query
 * @return {*}
 */
function getFunctions(query) {
  let functionsTokens = {};
  let functionsDescription = [];
  if (qregExrTranslate(query)) {
    functionsTokens = qregExrTranslate(query);
    functionsDescription = functionsTokens.function.split(',');
    const queryFuc = functionsDescription[0];
    const flagIsFunction = qregExrContains(functionsTokens.functionType);
    if (flagIsFunction.length <= 1) {
      const functionMap = CONVERT_FUNCTIONS_MAP[functionsTokens.functionType];
      functionsTokens = functionMap(
        queryFuc,
        functionsTokens,
        functionsDescription
      );
      functionsTokens.functionDescription = functionsDescription;
      query = queryFuc;
    } else {
      functionsTokens = {};
    }
  }
  return { query, functionsTokens };
}

function getDDTokensMulti(query, functionsTokens = null) {
  let varValues = [];
  let ddTokens = {};
  let getAritmeticExpresion2 = null;
  // 1 separar por ', '
  const queries2 = query.split(/\, (?![\s])/g);
  let queries3 = [];
  // 2 filtro de aritmetica
  let nrTokensGroups = [];
  const selects = [];
  for (let index = 0; index < queries2.length; index++) {
    const element = queries2[index];
    //evaluar si es necesario la aritmetica
    getAritmeticExpresion2 = getAritmeticExpresion(element, functionsTokens); // nrTokensGroupsU, select
    const nrTokensGroups2 = nrTokensGroups.concat(
      getAritmeticExpresion2.nrTokensGroupsU
    );
    selects.push(getAritmeticExpresion2.select);
    nrTokensGroups = nrTokensGroups2;
  }
  getAritmeticExpresion2.select = selects.join(',');
  const validateEventTypes2 = validateEventTypes(nrTokensGroups); // aggregatorMetric, eventTypes
  const validatewhere2 = validateWhere(nrTokensGroups, functionsTokens); // whereUsage, whereKeys, whereValues
  const faceters = validateFaceter(nrTokensGroups);
  varValues = getVarClause(nrTokensGroups);
  const validateOrderClause2 = validateOrderClause(
    nrTokensGroups,
    functionsTokens
  ); // order, orderKey, orderType
  const validateLimitClause2 = validateLimitClause(
    nrTokensGroups,
    functionsTokens
  ); // limit, limitKey
  const queryTranslated = [
    getSelectClauseArit(
      getAritmeticExpresion2.select,
      validateEventTypes2.eventTypes
    ),
    getWhereClause(
      validatewhere2.whereUsage,
      validatewhere2.whereKeys,
      validatewhere2.whereValues,
      functionsTokens
    ),
    getWhereClauseFunctions(
      validatewhere2.useWhere,
      nrTokensGroups,
      functionsTokens
    ),
    getFacetClause(faceters),
    getOrderClause(
      validateOrderClause2.order,
      validateOrderClause2.orderKey,
      validateOrderClause2.orderType
    ),
    getLimitClause(validateLimitClause2.limit, validateLimitClause2.limitKey)
  ].join(' ');
  return { queryTranslated, varValues };
}

/**
 *Function that filter metric for quit signal ( - ) in metric name
 * @param {String} query
 */
function filterSignalInMetric(query) {
  let matchChange = [];
  let resultsMatchs = qregExrQueryValidSignal(query);
  if (resultsMatchs) {
    for (let i = 0; i < resultsMatchs.length; i++) {
      matchChange.push(resultsMatchs[i].replace(new RegExp('-', 'g'), "~"));
    }
    let queryResult = query;
    for (let j = 0; j < matchChange.length; j++) {
      queryResult = queryResult.replace(resultsMatchs[j], matchChange[j]);
    }
    return queryResult;
  } else {
    return query;
  }
}

/**
 *
 *
 * @param {*} query
 * @param {*} [functionsTokens=null]
 * @return {*}
 */
function getAritmeticExpresion(query, functionsTokens = null) {
  let queryFinal = query;
  query = filterSignalInMetric(query);
  let queries = query.split(/[\(\)\*\/\+\-](?![\}\s'])/g);
  for (let i = 0; i < queries.length; i++) {
    queries[i] = queries[i].replace(new RegExp('~', 'g'), '-');
  }
  let queriesCp = [];
  let queriesTranslated = [];
  const ids = random(queries.length);
  for (let index = 0; index < queries.length; index++) {
    const query = queries[index];
    if (query.length > 1) {
      // Filtro funciones
      queriesCp.push([query, ids[index], getDDTokensFunctions(query)]);
    }
  }
  let nrTokensGroupsU = [];
  for (let index = 0; index < queriesCp.length; index++) {
    const number = queriesCp[index];
    queryFinal = queryFinal.replace(number[0], number[1].toString());
    const ddTokens = getDDTokens(number[0]);
    let ddMapTokens = mapToNrTokens(ddTokens);
    // Filtro de widget que requieren algun tipo de aggregator especial
    if (functionsTokens) {
      if (functionsTokens.functionType && functionsTokens.functionAggregator) {
        const msg = `Can't convert a metric with ${functionsTokens.functionAggregator} function  in ${functionsTokens.functionType} chart`;
        throw msg;
      }
      if (functionsTokens.functionType) {
        ddMapTokens.aggregator =
          SPECIAL_TYPES_MAP[functionsTokens.functionType];
        if (!ddMapTokens.aggregator) {
          const msg = `Can't convert a metric with ${functionsTokens.functionType} event type.`;
          throw msg;
        }
      }
      ddMapTokens = Object.assign(ddMapTokens, functionsTokens);
    }
    const nrTokensGroups = [ddMapTokens];
    nrTokensGroupsU.push(ddMapTokens);
    let aggregator = getDDTokensQuery(nrTokensGroups);
    if (functionsTokens) {
      ddMapTokens = Object.assign(ddMapTokens, functionsTokens);
      if (functionsTokens.functionAggregator) {
        aggregator = `${functionsTokens.functionAggregator
          }(${aggregator}${getFunctionsParams(functionsTokens.aggregatorParam)})`;
      }
    }
    queriesTranslated.push([aggregator, number[1], number[2]]);
  }
  const lexTransl = queryFinal.split(/(\d\d\d\d)/g);
  for (let index = 0; index < lexTransl.length; index++) {
    const lex = lexTransl[index];
    if (parseInt(lex, 10)) {
      queriesTranslated.forEach(item => {
        if (parseInt(lex, 10) === parseInt(item[1], 10)) {
          lexTransl[index] = item[0];
        }
      });
    }
  }
  const select = lexTransl.join(' ');
  return { select, nrTokensGroupsU };
}

function getDDTokensFunctions(ddQuery) {
  const nrQuery = ddQuery;
  // Implementar el soporte de funciones
  return nrQuery;
}

function getDDTokens(ddQuery, params = null) {
  const matches = qregExr(ddQuery);
  if (params) {
    Object.assign(matches, params)
  }
  return matches;
}

/**
 *
 *
 * @param {*} ddTokens
 * @return {*}
 */
function mapToNrTokens(ddTokens) {
  let aggregator = AGGREGATION_MAP[ddTokens.spaceAggregation];
  const metric = METRIC_MAP[ddTokens.metric][0];
  const eventType = METRIC_MAP[ddTokens.metric][1];
  let useWhere = ddTokens.scope !== '*';
  let whereKey = null;
  let useVar = false;
  let varValue = null;
  let varKey = null;
  if (ddTokens.scopeKey) {
    whereKey = ATTRIBUTE_MAP[ddTokens.scopeKey];
  }
  const whereValue = ddTokens.scopeValue;
  let faceter = null;
  if (ddTokens.grouping) {
    faceter = ATTRIBUTE_MAP[ddTokens.grouping];
  }
  if (ddTokens.functionType) {
    aggregator = AGGREGATION_MAP[ddTokens.functionType];
  }
  if (ddTokens.scopeVar) {
    useWhere = false;
    useVar = true;
    varValue = ddTokens.scopeVar;
    varKey = ddTokens.scopeVar;
  }
  return {
    aggregator: aggregator,
    metric: metric,
    eventType: eventType,
    useWhere: useWhere,
    whereKey: whereKey,
    whereValue: whereValue,
    faceter: faceter,
    useVar: useVar,
    varValue: varValue,
    varKey: varKey
  };
}

/**
 * Obtiene la secuencia del select del nrql
 *
 * @param {*} nrTokensGroups
 */
function getDDTokensQuery(nrTokensGroups) {
  const validateEventType = validateEventTypes(nrTokensGroups);
  const stringaggregator = [];
  validateEventType.aggregatorMetric.forEach(element => {
    stringaggregator.push(`${element[0]}(${element[1]})`);
  });
  const aggregator = stringaggregator.join('');
  return aggregator;
}

/**
 *
 *
 * @param {*} nrTokensGroups
 * @return {*}
 */
function validateEventTypes(nrTokensGroups) {
  const eventTypes = [];
  nrTokensGroups.forEach(nrTokens => {
    if (eventTypes.filter(item => item === nrTokens.eventType).length === 0) {
      eventTypes.push(nrTokens.eventType);
    }
  });
  if (eventTypes.length > 1) {
    const msg =
      "Can't convert a group of queryes with more than one event type.";
    throw msg;
  }
  const aggregatorMetric = [];
  nrTokensGroups.forEach(nrTokens => {
    aggregatorMetric.push([nrTokens.aggregator, nrTokens.metric]);
  });
  return { aggregatorMetric, eventTypes: eventTypes[0] };
}

function getFunctionsParams(functionParam) {
  const stringparams = [];
  if (functionParam) {
    functionParam.forEach(element => {
      stringparams.push(`, ${element}`);
    });
  }
  const params = stringparams.join(' ');
  return params;
}

/**
 *
 *
 * @param {*} nrTokensGroups
 * @param {*} functionsTokens
 * @return {*}
 */
function validateWhere(nrTokensGroups, functionsTokens) {
  const whereUsage = [];
  const whereKeys = [];
  const whereValues = [];
  nrTokensGroups.forEach(nrTokens => {
    if (whereUsage.filter(item => item === nrTokens.useWhere).length === 0) {
      whereUsage.push(nrTokens.useWhere);
    }
  });
  nrTokensGroups.forEach(nrTokens => {
    if (whereKeys.filter(item => item === nrTokens.whereKey).length === 0) {
      whereKeys.push(nrTokens.whereKey);
    }
  });
  if (whereUsage.length > 1 || whereKeys.length > 1) {
    const msg = 'Mixed scope can lead to mixed usage of WHERE clause.';
    throw msg;
  }
  nrTokensGroups.forEach(nrTokens => {
    if (whereValues.filter(item => item === nrTokens.whereValue).length === 0) {
      whereValues.push(nrTokens.whereValue);
    }
  });
  return { whereUsage: whereUsage[0], whereKeys: whereKeys[0], whereValues };
}

function validateFaceter(nrTokensGroups) {
  const faceters = [];
  nrTokensGroups.forEach(nrTokens => {
    if (faceters.filter(item => item === nrTokens.faceter).length === 0) {
      faceters.push(nrTokens.faceter);
    }
  });
  if (faceters && faceters.length > 1) {
    const msg = "Can't convert a group of queryes with mixed gouping.";
    throw msg;
  }
  return faceters;
}

function getVarClause(nrTokensGroups) {
  const useVar = [];
  const varKey = [];
  const varValue = [];
  const varValues = [];
  nrTokensGroups.forEach(nrTokens => {
    useVar.push(nrTokens.useVar);
  });
  nrTokensGroups.forEach(nrTokens => {
    varKey.push(nrTokens.varKey);
  });
  nrTokensGroups.forEach(nrTokens => {
    varValue.push(nrTokens.varValue);
  });
  if (useVar[0]) {
    varValues.push({ key: varKey[0], value: varValue[0] });
  }
  return varValues;
}

function validateOrderClause(nrTokensGroups, functionsTokens) {
  const order = [];
  let orderType = null;
  let orderKey = [];
  nrTokensGroups.forEach(nrTokens => {
    if (nrTokens.useOrder) {
      order.push(nrTokens.useOrder);
    }
  });
  if (order.length > 1) {
    const msg = "Can't convert a query of queryes with multiple order.";
    throw msg;
  }
  if (order.length === 1) {
    nrTokensGroups.forEach(nrTokens => {
      orderKey.push(nrTokens.metric);
    });
    orderKey = orderKey[0];
    if (functionsTokens.functionDescription) {
      if (functionsTokens.functionDescription.length > 2) {
        orderType = functionsTokens.functionDescription[3].split("'").join('');
      }
    }
  }
  return { order, orderKey, orderType };
}

function validateLimitClause(nrTokensGroups, functionsTokens) {
  const limit = [];
  let limitKey = null;
  nrTokensGroups.forEach(nrTokens => {
    if (nrTokens.useLimit) {
      limit.push(nrTokens.useLimit);
    }
  });
  if (limit.length > 1) {
    const msg = "Can't convert a query of queryes with multiples limit.";
    throw msg;
  }
  if (limit.length === 1) {
    if (functionsTokens.functionDescription) {
      limitKey = functionsTokens.functionDescription[1];
    }
  }
  return { limit, limitKey };
}

function getSelectClauseArit(select, eventType) {
  return [' SELECT ', select, ' FROM ', eventType].join(' ');
}

function getWhereClause(useWhere, whereKey, whereValues, functionsTokens) {
  let where = '';
  if (useWhere) {
    const whereValues2 = whereValues.map(whereValue => {
      return `${whereKey} = '${whereValue}'`;
    });
    where = [whereValues2.join(' OR ')];
    where = where.join(' OR ');
    where = ['WHERE', '(', where, ')'].join(' ');
  }
  return where;
}

function getWhereClauseFunctions(useWhere, nrTokensGroups, functionsTokens) {
  let where = '';
  if (useWhere && functionsTokens.useWhereFunction) {
    where = 'AND ';
  }
  if (functionsTokens.useWhereFunction) {
    if (!useWhere) {
      where = 'WHERE ';
    }
    const whereKey = nrTokensGroups[0].metric;
    const whereType = nrTokensGroups[0].whereClause;
    where = `${where} ('${whereKey}' ${whereType})`;
  }
  return where;
}

function getFacetClause(faceters) {
  if (faceters[0] === null) {
    return '';
  }
  return ['FACET', faceters.join(', ')].join(' ');
}

function getOrderClause(useOrder, orderKey, orderType) {
  if (useOrder.length > 0) {
    return `ORDER BY '${orderKey}' ${orderType}`;
  }
  return '';
}

function getLimitClause(useLimit, limitKey) {
  if (useLimit.length > 0) {
    return `LIMIT ${limitKey}`;
  }
  return '';
}

export {
  translate,
  getFunctions,
  getDDTokensMulti,
  getAritmeticExpresion,
  getDDTokensFunctions,
  getDDTokens,
  mapToNrTokens,
  getDDTokensQuery,
  validateEventTypes,
  getFunctionsParams,
  validateWhere,
  validateFaceter,
  getVarClause,
  validateOrderClause,
  validateLimitClause,
  getSelectClauseArit,
  getWhereClause,
  getWhereClauseFunctions,
  getFacetClause,
  getOrderClause,
  getLimitClause,
  filterSignalInMetric
};
