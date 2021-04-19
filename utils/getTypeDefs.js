const getTypeDef = (name, schema, imageKeys) => {
  return `
    type ${name} implements Node {
      ${schema}
      ${imageKeys.includes(name) ? 'local: File' : ''}
    }
  `
}

module.exports = (schemas, imageKeys) => {
  return Object.keys(schemas)
    .map(key => getTypeDef(key, schemas[key], imageKeys))
}
