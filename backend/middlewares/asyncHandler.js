//properly catches error from async controller functions in Express

const asyncHandler = (fn) => {

  return (req, res, next) => {

    Promise.resolve(fn(req, res, next))
      .catch(next);

  };

};

export default asyncHandler;