/*import install from 'jasmine-es6';
install();
*/

describe("quotable", () => {
    describe("crossenv/Utils", () => {
        var Utils = require('../crossenv/utils');
        describe("sanitizeId", () => {
            it('replaces blank spaces with underscores', function() {
                expect(Utils.sanitizeId("a b c")).toEqual("a_b_c");
            });
        });
    });

    describe('BaseState', function() {
        beforeEach(module('quotable'));

        describe('sanitizeId()', function() {
            var $factory = null;
            beforeEach(inject(function(BaseState) {
                $factory = BaseState;
            }));

            it('replaces blank spaces with undersocres', function() {
                expect($factory.sanitizeId("a b c")).toEqual("a_b_c");
            });

        });
    });
});
