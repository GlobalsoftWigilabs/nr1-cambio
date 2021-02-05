import { translate, getDDTokens, validateFaceter,getWhereClauseFunctions } from '../../dd2nr/transpiler';

describe('TestMetrics', () => {
  test('TestTraspilerSimple', () => {
    const value = translate('avg:system.cpu.user{*}', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   average(system.cpu.user)   FROM  Metric     '
    });
  });

  test('TestTraspilerSimpleFacet', () => {
    const value = translate('avg:system.load.1{*} by {host}', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   average(system.load.1)   FROM  Metric   FACET host.name  '
    });
  });

  test('TestTraspilerSimpleBy', () => {
    const value = translate(
      'avg:system.cpu.user{host:wigilabs-demo-server}',
      null
    );
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        " SELECT   average(system.cpu.user)   FROM  Metric WHERE ( host.name = 'wigilabs-demo-server' )    "
    });
  });

  test('TestTraspilerSimpleFacetBy', () => {
    const value = translate(
      'avg:system.load.1{host:wigilabs-demo-server} by {host}',
      null
    );
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        " SELECT   average(system.load.1)   FROM  Metric WHERE ( host.name = 'wigilabs-demo-server' )  FACET host.name  "
    });
  });
});

describe('TestFunctionsAggregators', () => {
  test('TestTraspilerFunctionAvg', () => {
    const value = translate('avg:system.load.1{*} by {host}', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   average(system.load.1)   FROM  Metric   FACET host.name  '
    });
  });

  test('TestTraspilerFunctionMax', () => {
    const value = translate('max:system.load.1{*} by {host}', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   max(system.load.1)   FROM  Metric   FACET host.name  '
    });
  });

  test('TestTraspilerFunctionMin', () => {
    const value = translate('min:system.load.1{*} by {host}', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   min(system.load.1)   FROM  Metric   FACET host.name  '
    });
  });

  test('TestTraspilerFunctionSum', () => {
    const value = translate('sum:system.load.1{*} by {host}', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   sum(system.load.1)   FROM  Metric   FACET host.name  '
    });
  });
});

describe('TestSpecialCharts', () => {
  test('TestTraspilerFunctionHeatmap', () => {
    const value = translate('avg:system.load.1{*} by {host}', 'heatmap'); // verificar 'by'  clause
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   histogram(system.load.1)   FROM  Metric   FACET host.name  '
    });
  });

  test('TestTraspilerFunctionDistribution', () => {
    const value = translate('avg:system.load.1{*}', 'distribution');
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   histogram(system.load.1)   FROM  Metric     '
    });
  });
});

describe('TestMultipleQueriesAndArithmetic', () => {
  test('TestTraspilerMultiple', () => {
    const value = translate(
      'avg:system.load.1{*}, avg:system.load.5{*}, avg:system.load.15{*}',
      null
    );
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   average(system.load.1) , average(system.load.5) , average(system.load.15)   FROM  Metric     '
    });
  });

  test('TestTraspilerMultipleArithmetic', () => {
    const value = translate(
      '(avg:system.load.1{*}+avg:system.load.5{*}+avg:system.load.15{*})',
      null
    );
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT  ( average(system.load.1) + average(system.load.5) + average(system.load.15) )  FROM  Metric     '
    });
  });

  test('TestTraspilerMultipleArithmetic2', () => {
    const value = translate(
      'avg:system.load.1{*}*(avg:system.load.1{*}+avg:system.load.5{*}+avg:system.load.15{*})',
      null
    );
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   average(system.load.1) *( average(system.load.1) + average(system.load.5) + average(system.load.15) )  FROM  Metric     '
    });
  });

  test('TestTraspilerMultipleArithmetic3', () => {
    const value = translate(
      '2*(avg:system.load.1{*}+avg:system.load.5{*}+avg:system.load.15{*})',
      null
    );
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT  2*( average(system.load.1) + average(system.load.5) + average(system.load.15) )  FROM  Metric     '
    });
  });
});

describe('TestTraspilerFunctionPerSecond', () => {
  test('TestTraspilerFunctionPerSecond', () => {
    const value = translate('per_second(avg:system.cpu.user{*})', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   rate(average(system.cpu.user), 1 second)   FROM  Metric     '
    });
  });

  test('TestTraspilerFunctionPerMinute', () => {
    const value = translate('per_minute(avg:system.cpu.user{*})', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   rate(average(system.cpu.user), 1 minute)   FROM  Metric     '
    });
  });

  test('TestTraspilerFunctionPerHour', () => {
    const value = translate('per_hour(avg:system.cpu.user{*})', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   rate(average(system.cpu.user), 1 hour)   FROM  Metric     '
    });
  });

  test('TestTraspilerFunctionAbs', () => {
    const value = translate('abs(avg:system.cpu.user{*})', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   abs(average(system.cpu.user))   FROM  Metric     '
    });
  });

  test('TestTraspilerFunctionlog2', () => {
    const value = translate('log2(avg:system.cpu.user{*})', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   log2(average(system.cpu.user))   FROM  Metric     '
    });
  });

  test('TestTraspilerFunctionlog10', () => {
    const value = translate('log10(avg:system.cpu.user{*})', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   log10(average(system.cpu.user))   FROM  Metric     '
    });
  });

  test('TestTraspilerFunctionTop', () => {
    const value = translate(
      "top(avg:system.cpu.user{*}, 10, 'mean', 'desc2')",
      null
    );
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        " SELECT   average(system.cpu.user)   FROM  Metric    ORDER BY 'system.cpu.user'  desc2 LIMIT  10"
    });
  });

  test('TestTraspilerFunctionCountNonZero', () => {
    const value = translate('count_nonzero(avg:system.cpu.user{*})', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        " SELECT   count(system.cpu.user)   FROM  Metric  WHERE  ('system.cpu.user' != 0)   "
    });
  });

  test('TestTraspilerFunctionCountNotNull', () => {
    const value = translate('count_not_null(avg:system.cpu.user{*})', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        " SELECT   count(system.cpu.user)   FROM  Metric  WHERE  ('system.cpu.user' is NOT NULL)   "
    });
  });

  test('TestTraspilerFunctionVaribles', () => {
    const value = translate('count_not_null(avg:system.cpu.user{$host})', null);
    expect(value).toEqual({
      getDDTokensMulti2: [
        {
          key: 'host',
          value: 'host'
        }
      ],
      queryTranslated:
        " SELECT   count(system.cpu.user)   FROM  Metric  WHERE  ('system.cpu.user' is NOT NULL)   "
    });
  });

  // system.load.1{ $scope }
  test('Test wrong query', () => {
    const value = translate('system.load.1{$scope}', null);
    expect(value).toEqual({
      queryTranslated: null,
      getDDTokensMulti2: [
        {
          key: 'scope',
          value: 'scope'
        }
      ]
    });
  });

  test('Test dd tokens query', () => {
    const value = getDDTokens('avg:system.load.1{host:wigilabs-demo-server} by {host}', { "host": "empty-host" });
    expect(value).toEqual({
      grouping: "host",
      host: "empty-host",
      metric: "system.load.1",
      scope: "host:wigilabs-demo-server",
      scopeKey: "host",
      scopeValue: "wigilabs-demo-server",
      scopeVar: undefined,
      spaceAggregation: "avg"
    });
  });

  test('Test validate faceters', () => {
    let value = [];
    try {
      value = validateFaceter([
        {
          faceter: 'hostname'
        }, {
          faceter: 'SOversion'
        }
      ]);
    } catch (err) {
      expect(err).toBe("Can't convert a group of queryes with mixed gouping.");
    }
  });

  test('Test validate where clause', () => {
    const value=getWhereClauseFunctions(true,[{metric:"agentName",whereClause:"='Infrastructure'"}],{useWhereFunction:true});
    expect(value).toMatch("AND  ('agentName' ='Infrastructure')");
  });
});
