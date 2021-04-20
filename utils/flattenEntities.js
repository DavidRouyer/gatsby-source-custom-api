const removeChildEntities = (entity) => {
  const { childEntities, ...rest } = entity
  return rest
}

const flattenEntities = (entities, flat) => {
  let flatEntities = flat || []
  entities.forEach((entity) => {
    flatEntities = [removeChildEntities(entity), ...flatEntities]
    if (entity.childEntities) {
      flatEntities = flattenEntities(entity.childEntities, flatEntities)
    }
  })
  return flatEntities
}

module.exports = flattenEntities
