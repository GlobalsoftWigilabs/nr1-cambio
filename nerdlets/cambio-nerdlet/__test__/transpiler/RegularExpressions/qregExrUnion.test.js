import { qregExrQueryValidUnion } from '../../../dd2nr/transpiler/regexr';

describe('RegExr union', () => {
    test('Test RegExr validate nothing union', () => {
        const query = 'avg:system.load.1{*}';
        const value = qregExrQueryValidUnion(query);
        expect(value).toBeNull();
    });
    test('Test RegExr validate union', () => {
        const query = 'avg:system.load.1{host:myhost}';
        const value = qregExrQueryValidUnion(query);
        expect(value).toEqual(['{host:myhost}']);
    });
    test('Test RegExr validate union wrong', () => {
        const query = 'avg:system.load.1{host:myhost,port:58}';
        const value = qregExrQueryValidUnion(query);
        expect(value).toBeNull();
    });
});
