/**
 * respond.test.js — unit tests for utils/respond.js
 *
 * Tests:
 *  - ok() returns 200 with { success: true, ...data }
 *  - fail() returns specified status with { success: false, message }
 *  - fail() defaults to 400
 */
import { describe, it, expect, jest } from '@jest/globals';
import { ok, fail } from '../../utils/respond.js';

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('respond helpers', () => {
  describe('ok()', () => {
    it('calls res.json with success:true and spreads data', () => {
      const res = makeRes();
      ok(res, { token: 'abc', user: { id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, token: 'abc', user: { id: 1 } });
    });

    it('works with empty data object (default)', () => {
      const res = makeRes();
      ok(res);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('does not call res.status', () => {
      const res = makeRes();
      ok(res, { x: 1 });
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('fail()', () => {
    it('defaults to 400 status', () => {
      const res = makeRes();
      fail(res, 'Something went wrong');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Something went wrong' });
    });

    it('accepts a custom status code', () => {
      const res = makeRes();
      fail(res, 'Not found', 404);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
    });

    it('works with 401', () => {
      const res = makeRes();
      fail(res, 'Unauthorized', 401);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('works with 500', () => {
      const res = makeRes();
      fail(res, 'Server error', 500);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('works with 409 conflict', () => {
      const res = makeRes();
      fail(res, 'Email exists', 409);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email exists' });
    });
  });
});
