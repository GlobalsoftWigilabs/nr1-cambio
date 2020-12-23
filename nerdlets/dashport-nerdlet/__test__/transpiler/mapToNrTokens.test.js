import { mapToNrTokens } from '../../dd2nr/transpiler';

describe('Test Map To NrTokens', () => {
  test('Test mapToNrTokens heatmap', () => {
    const value = mapToNrTokens({
      spaceAggregation: 'avg',
      metric: 'system.load.1',
      scope: '*',
      scopeKey: null,
      scopeValue: null,
      scopeVar: null,
      grouping: null
    });
    expect(value).toEqual({
      aggregator: 'average',
      metric: 'system.load.1',
      eventType: 'Metric',
      useWhere: false,
      whereKey: null,
      whereValue: null,
      faceter: null,
      useVar: false,
      varValue: null,
      varKey: null
    });
  });
});
