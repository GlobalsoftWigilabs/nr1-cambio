import { convertNrql } from '../../dd2nr';

describe('Test Convert Nrql', () => {
  test('Test convertNrql', () => {
    const value = convertNrql(
      'avg:system.cpu.user{host:wigilabs-demo-server} by {host}"',
      null
    );
    expect(value).toEqual({
      queryTranslated:
        " SELECT   average(system.cpu.user)   FROM  Metric WHERE ( host.name = 'wigilabs-demo-server' )  FACET host.name  ",
      getDDTokensMulti2: []
    });
  });

  test('Test convertNrql Timeseries', () => {
    const value = convertNrql(
      'avg:system.cpu.user{host:wigilabs-demo-server} by {host}"',
      'timeseries'
    );
    expect(value).toEqual({
      queryTranslated:
        " SELECT   average(system.cpu.user)   FROM  Metric WHERE ( host.name = 'wigilabs-demo-server' )  FACET host.name   TIMESERIES",
      getDDTokensMulti2: []
    });
  });
});
