import { getAritmeticExpresion } from '../../dd2nr/transpiler';

describe('Test Get Aritmetic Expresion', () => {
  test('Test getAritmeticExpresion heatmap', () => {
    const value = getAritmeticExpresion('avg:system.load.1{*}', {
      functionType: 'heatmap'
    });
    expect(value).toEqual({
      select: ' histogram(system.load.1) ',
      nrTokensGroupsU: [
        {
          aggregator: 'histogram',
          metric: 'system.load.1',
          eventType: 'Metric',
          useWhere: false,
          whereKey: null,
          whereValue: undefined,
          faceter: null,
          useVar: false,
          varValue: null,
          varKey: null,
          functionType: 'heatmap'
        }
      ]
    });
  });

  test('Test getAritmeticExpresion', () => {
    const value = getAritmeticExpresion(
      'avg:system.cpu.user{host:wigilabs-demo-server} by {host}',
      {}
    );
    expect(value).toEqual({
      select: ' average(system.cpu.user) ',
      nrTokensGroupsU: [
        {
          aggregator: 'average',
          metric: 'system.cpu.user',
          eventType: 'Metric',
          useWhere: true,
          whereKey: 'host.name',
          whereValue: 'wigilabs-demo-server',
          faceter: 'host.name',
          useVar: false,
          varValue: null,
          varKey: null
        }
      ]
    });
  });

  test('Test getAritmeticExpresion FunctionPerSecond', () => {
    const value = getAritmeticExpresion('avg:system.cpu.user{*}', {
      functionAggregator: 'rate',
      useAggregatorParam: true,
      aggregatorParam: ['1 second'],
      functionDescription: ['avg:system.cpu.user{*}']
    });
    expect(value).toEqual({
      select: ' rate(average(system.cpu.user), 1 second) ',
      nrTokensGroupsU: [
        {
          aggregator: 'average',
          metric: 'system.cpu.user',
          eventType: 'Metric',
          useWhere: false,
          whereKey: null,
          whereValue: undefined,
          faceter: null,
          useVar: false,
          varValue: null,
          varKey: null,
          functionAggregator: 'rate',
          useAggregatorParam: true,
          aggregatorParam: ['1 second'],
          functionDescription: ['avg:system.cpu.user{*}']
        }
      ]
    });
  });
});
