const { every, flatten, isObjectLike, isArray } = require('lodash')
const { v4: uuidv4 } = require('uuid')

const getEntityNodeLinks = (entities, nodeData) => {
  const links = {}
  entities.forEach((entity) => {
    const { name } = entity
    const linkName = name + '___NODE'
    if (links[linkName]) {
      links[linkName] = isArray(links[linkName])
        ? [...links[linkName], entity.id]
        : [links[linkName], entity.id]
      // check if node-content is an array.
      // if so, make the link also an array, to avoid conflicts,
      // when you have node-content-arrays with just one element
    } else if (isArray(nodeData[name])) {
      links[linkName] = [entity.id]
    } else {
      links[linkName] = entity.id
    }
  })
  return links
}

const getChildNodeKeys = (data, schemas) => {
  if (!data) return []
  return Object.keys(data).filter((key) => {
    if (isArray(data[key]) && every(data[key], isObjectLike)) {
      return true
    }
    if (isObjectLike(data[key]) && !isArray(data[key])) return true
    return false
  })
}

const getDataWithoutChildEntities = (data, childNodeKeys) => {
  const newData = { ...data }
  childNodeKeys.forEach((key) => {
    delete newData[key]
  })
  return newData
}

const buildEntity = ({
  name, data, schemas, createNodeId
}) => {
  const childNodeKeys = getChildNodeKeys(data, schemas)
  const childEntities = flatten(
    childNodeKeys.map(key => (
      createNodeEntities({
        name: key,
        data: data[key],
        schemas,
        createNodeId
      })
    ))
  )
  const dataWithoutChildEntities = getDataWithoutChildEntities(data, childNodeKeys)
  const entityNodeLinks = getEntityNodeLinks(childEntities, data)
  return [{
    id: createNodeId(name + uuidv4()),
    name,
    data: dataWithoutChildEntities,
    links: entityNodeLinks,
    childEntities
  }]
}

const normalizeData = (name, data, schemas) => {
  const schema = schemas[name]
  if (!data) return { dummy: true }
  if (!Object.keys(data).length && !schema) {
    return { dummy: true }
  }
  if (!schema) {
    console.log(`Object '${name}': Better provide a schema!`)
  }
  return data
}

const createNodeEntities = ({
  name, data, createNodeId, schemas
}) => {
  if (isArray(data) && every(data, isObjectLike)) {
    const entitiesArray = data.map(d => buildEntity({
      name,
      data: normalizeData(name, d, schemas),
      schemas,
      createNodeId
    }))
    return flatten(entitiesArray)
  }
  if (isObjectLike(data) && !isArray(data)) {
    return buildEntity({
      name,
      data: normalizeData(name, data, schemas),
      schemas,
      createNodeId
    })
  }
  return []
}

module.exports = createNodeEntities
