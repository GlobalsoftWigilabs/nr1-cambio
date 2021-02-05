import { qregExr } from '../../../dd2nr/transpiler/regexr';

describe('RegExr validate', () => {
    test('Test RegExr compistion of simply promql', () => {
        const query = 'avg:system.cpu.user{host:wigilabs-demo-server} by {host}';
        const value = qregExr(query);
        expect(value).toEqual({
            spaceAggregation: 'avg',
            metric: 'system.cpu.user',
            scope: 'host:wigilabs-demo-server',
            scopeKey: 'host',
            scopeValue: 'wigilabs-demo-server',
            scopeVar: undefined,
            grouping: 'host'
        });
    });
    test('Test RegExr validate none promql', () => {
        const query = '';
        const value = qregExr(query);
        expect(value).toBeNull();
    });
    test('Test RegExr validate metric major complexity', () => {
        const query = 'avg:kubernetes.memory.usage{cluster-name:prd-solr-001} by {host}';
        const value = qregExr(query);
        expect(value).toEqual({
            spaceAggregation: 'avg',
            metric: 'kubernetes.memory.usage',
            scope: 'cluster-name:prd-solr-001',
            scopeKey: 'cluster-name',
            scopeValue: 'prd-solr-001',
            scopeVar: undefined,
            grouping: 'host'
        });
    });
});
