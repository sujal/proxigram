module.exports = exports = function simpleTimestamps (schema, options) {
  schema.add({ created_at: {
      type: Date,
      default: new Date()
    },
    updated_at: {
      type: Date
    }
  })

  schema.pre('save', function (next) {
    this.updated_at = new Date
    next()
  })

  if (options && options.index) {
    schema.path('updated_at').index(options.index)
  }
}