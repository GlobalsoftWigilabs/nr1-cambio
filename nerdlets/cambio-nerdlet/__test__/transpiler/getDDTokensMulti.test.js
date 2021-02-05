import { getDDTokensMulti } from '../../dd2nr/transpiler';

describe('Test Get DD Tokens Multi', () => {
  test('Test getDDTokensMulti count_not_null', () => {
    const value = getDDTokensMulti(
      'avg:system.cpu.user{host:wigilabs-demo-server} by {host}"',
      {}
    );
    expect(value).toEqual({
      queryTranslated:
        " SELECT   average(system.cpu.user)   FROM  Metric WHERE ( host.name = 'wigilabs-demo-server' )  FACET host.name  ",
      varValues: []
    });
  });
});
