import { random } from '../../../dd2nr/transpiler/random';

describe('Random generation', () => {
    test('Test random 1 numbers', () => {
        const value = random(1);
        expect(value.length).toBe(1);
    });
    test('Test random 6 numbers', () => {
        const value = random(6);
        expect(value.length).toBe(6);
    });
    test('Test random 60 numbers', () => {
        const value = random(60);
        expect(value.length).toBe(60);
    });
});
