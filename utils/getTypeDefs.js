const getTypeDef = (name, schema, imageKeys) => {
  return `
    type ${name} implements Node {
      ${schema}
      ${imageKeys.includes(name) ? 'local: File @link(from: "local___NODE")' : ''}
    }
  `
}

module.exports = (schemas, imageKeys) => {
  return Object.keys(schemas)
    .map(key => getTypeDef(key, schemas[key], imageKeys))
}
