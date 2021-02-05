import { qregExrQueryValid } from '../../../dd2nr/transpiler/regexr';

describe('RegExr validate', () => {
    test('Test RegExr validate metric wrong structure', () => {
        const query = 'avg:system.load.1{*}';
        const value = qregExrQueryValid(query);
        expect(value).toBeNull();
    });
    test('Test RegExr validate metric good structure', () => {
        const query = '{mimetricts:values}';
        const value = qregExrQueryValid(query);
        expect(value).toEqual(['{mimetricts:']);
    });
    test('Test RegExr validate metric major complexity', () => {
        const query = '{mimetricts:values},{host:my-host}';
        const value = qregExrQueryValid(query);
        expect(value).toEqual(['{mimetricts:','{host:']);
    });
});
