import Routine from "../models/routineModel.js";

/**
 * @desc   Create Routine
 * @route  POST /api/routines
 */
export const createRoutine = async (req, res) => {
  const { title, description } = req.body;

  // ✅ Basic validation
  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  const routine = await Routine.create({
    user: req.user.id, // from authMiddleware
    title,
    description,
  });

  res.status(201).json({
    success: true,
    data: routine,
  });
};

/**
 * @desc   Get All Routines
 * @route  GET /api/routines
 */
export const getRoutines = async (req, res) => {
  const routines = await Routine.find({ user: req.user.id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: routines.length,
    data: routines,
  });
};

/**
 * @desc   Update Routine
 * @route  PUT /api/routines/:id
 */
export const updateRoutine = async (req, res) => {
  const routine = await Routine.findById(req.params.id);

  // ✅ Check existence
  if (!routine) {
    return res.status(404).json({
      success: false,
      message: "Routine not found",
    });
  }

  // ✅ Authorization check
  if (routine.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  const updatedRoutine = await Routine.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: updatedRoutine,
  });
};

/**
 * @desc   Delete Routine
 * @route  DELETE /api/routines/:id
 */
export const deleteRoutine = async (req, res) => {
  const routine = await Routine.findById(req.params.id);

  // ✅ Check existence
  if (!routine) {
    return res.status(404).json({
      success: false,
      message: "Routine not found",
    });
  }

  // ✅ Authorization check
  if (routine.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  await routine.deleteOne();

  res.status(200).json({
    success: true,
    message: "Routine deleted successfully",
  });
};