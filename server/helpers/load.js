const load = (to, from, entity, Model, modelEntity) => {
  return async (req, res, next) => {
    try {
      let doc;
      if (modelEntity == undefined) {
        doc = await Model.findOne({
          _id: req[from][entity],
        });
      } else {
        doc = await Model.findOne({
          modelEntity: req[from][entity],
        });
      }

      if (doc) {
        req[to] = doc;
        return next();
      } else {
        return res.status(404).json({
          message: 'No valid entry found',
        });
      }
    } catch (error) {
      return res.status(500).json({
        error,
      });
    }
  };
};

module.exports = { load };
