import { describe, it, expect, vi } from 'vitest';
import { reorderRoutines } from '../controllers/routineController.js';

describe('Routine Reorder Controller Unit Tests (#1301)', () => {
  it('returns 401 when user is unauthenticated', async () => {
    const req = { userId: null, body: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await reorderRoutines(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it('returns 400 when items parameter is not an array', async () => {
    const req = { userId: 'user123', body: { items: 'invalid' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await reorderRoutines(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Items array is required for reordering' })
    );
  });
});
