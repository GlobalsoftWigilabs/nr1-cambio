import { getFunctions } from '../../dd2nr/transpiler';

describe('Test Get Functions', () => {
  test('Test getFunctions abs', () => {
    const value = getFunctions('abs(system.load.1{*})');
    expect(value).toEqual({
      query: 'system.load.1{*}',
      functionsTokens: {
        aggregatorParam: [],
        functionAggregator: 'abs',
        functionDescription: ['system.load.1{*}'],
        useAggregatorParam: true
      }
    });
  });

  test('Test getFunctions Top', () => {
    const value = getFunctions(
      "top(avg:system.cpu.user{*}, 10, 'mean', 'desc')"
    );
    expect(value).toEqual({
      query: 'avg:system.cpu.user{*}',
      functionsTokens: {
        functionDescription: [
          'avg:system.cpu.user{*}',
          ' 10',
          " 'mean'",
          " 'desc'"
        ],
        useLimit: true,
        useOrder: true
      }
    });
  });

  test('Test getFunctions Log10', () => {
    const value = getFunctions('log10(avg:system.cpu.user{*})');
    expect(value).toEqual({
      query: 'avg:system.cpu.user{*}',
      functionsTokens: {
        aggregatorParam: [],
        functionAggregator: 'log10',
        functionDescription: ['avg:system.cpu.user{*}'],
        useAggregatorParam: true
      }
    });
  });

  test('Test getFunctions PerSecond', () => {
    const value = getFunctions('per_second(avg:system.cpu.user{*})');
    expect(value).toEqual({
      query: 'avg:system.cpu.user{*}',
      functionsTokens: {
        aggregatorParam: ['1 second'],
        functionAggregator: 'rate',
        functionDescription: ['avg:system.cpu.user{*}'],
        useAggregatorParam: true
      }
    });
  });

  test('Test getFunctions PerMinute', () => {
    const value = getFunctions('per_minute(avg:system.cpu.user{*})');
    expect(value).toEqual({
      query: 'avg:system.cpu.user{*}',
      functionsTokens: {
        aggregatorParam: ['1 minute'],
        functionAggregator: 'rate',
        functionDescription: ['avg:system.cpu.user{*}'],
        useAggregatorParam: true
      }
    });
  });

  test('Test getFunctions PerHour', () => {
    const value = getFunctions('per_hour(avg:system.cpu.user{*})');
    expect(value).toEqual({
      query: 'avg:system.cpu.user{*}',
      functionsTokens: {
        aggregatorParam: ['1 hour'],
        functionAggregator: 'rate',
        functionDescription: ['avg:system.cpu.user{*}'],
        useAggregatorParam: true
      }
    });
  });

  test('Test getFunctions Log2', () => {
    const value = getFunctions('log2(avg:system.cpu.user{*})');
    expect(value).toEqual({
      query: 'avg:system.cpu.user{*}',
      functionsTokens: {
        aggregatorParam: [],
        functionAggregator: 'log2',
        functionDescription: ['avg:system.cpu.user{*}'],
        useAggregatorParam: true
      }
    });
  });

  test('Test getFunctions CountNonZero', () => {
    const value = getFunctions('count_nonzero(avg:system.cpu.user{*})');
    expect(value).toEqual({
      query: 'avg:system.cpu.user{*}',
      functionsTokens: {
        aggregator: 'count',
        functionDescription: ['avg:system.cpu.user{*}'],
        useWhereFunction: true,
        whereClause: '!= 0'
      }
    });
  });

  test('Test getFunctions CountNotNull', () => {
    const value = getFunctions('count_not_null(avg:system.cpu.user{*})');
    expect(value).toEqual({
      query: 'avg:system.cpu.user{*}',
      functionsTokens: {
        aggregator: 'count',
        functionDescription: ['avg:system.cpu.user{*}'],
        useWhereFunction: true,
        whereClause: 'is NOT NULL'
      }
    });
  });
});
