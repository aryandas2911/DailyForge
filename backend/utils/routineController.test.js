import assert from "node:assert/strict";
import test from "node:test";
import { getPublicRoutine } from "../controllers/routineController.js";
import Routine from "../src/models/Routine.js";

test("getPublicRoutine returns response with routine property", async () => {
  const fakeRoutine = {
    _id: "60d5ecb8b5c9c22b4c8b4567",
    name: "Morning Routine",
    description: "Daily habit tracker",
    userId: "60d5ecb8b5c9c22b4c8b4568",
    adaptiveSettings: { burnoutScore: 10 },
    items: [],
    toObject() {
      return {
        _id: this._id,
        name: this.name,
        description: this.description,
        userId: this.userId,
        adaptiveSettings: this.adaptiveSettings,
        items: this.items,
      };
    },
  };

  const originalFindById = Routine.findById;
  Routine.findById = () => ({
    populate() {
      return Promise.resolve(fakeRoutine);
    },
  });

  try {
    const req = { params: { id: fakeRoutine._id } };
    let responseStatus = null;
    let responseData = null;

    const res = {
      status(s) {
        responseStatus = s;
        return this;
      },
      json(d) {
        responseData = d;
        return this;
      },
    };

    await getPublicRoutine(req, res);

    assert.equal(responseStatus, 200);
    assert.equal(responseData.success, true);
    assert.ok(responseData.routine, "response should contain 'routine' key");
    assert.equal(responseData.routine.name, "Morning Routine");
    assert.equal(responseData.routine.userId, undefined, "userId should be excluded");
    assert.equal(responseData.routine.adaptiveSettings, undefined, "adaptiveSettings should be excluded");
  } finally {
    Routine.findById = originalFindById;
  }
});
