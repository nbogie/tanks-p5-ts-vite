import { partition } from './utils';
test('partition', () => {
    function isEven(n: number): boolean {
        return n % 2 === 0;
    }
    expect(partition([1, 2, 3, 4, 5, 6, 7, 8, 9], isEven)).toStrictEqual([
        [2, 4, 6, 8],
        [1, 3, 5, 7, 9],
    ]);
});
