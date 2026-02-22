import { test } from 'tap';
import { OK_CODE, CREATED_CODE } from '../src/utils/common';

test('Common constants', async (t) => {
    t.test('HTTP status codes', async (t) => {
        t.equal(OK_CODE, 200, 'should have correct OK status code');
        t.equal(CREATED_CODE, 201, 'should have correct CREATED status code');
    });
});