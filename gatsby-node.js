const fetch = require('node-fetch')
const createNodeEntities = require('./createNodeEntities')
const normalizeKeys = require('./utils/normalizeKeys')
const flattenEntities = require('./utils/flattenEntities')
const loadImages = require('./utils/loadImages')
const getUrl = require('./utils/getUrl')
const getTypeDefs = require('./utils/getTypeDefs')
const buildNode = require('./utils/buildNode')

exports.createSchemaCustomization = ({
  actions: { createTypes }
}, configOptions) => {
  const {
    imageKeys = ['image'],
    schemas = {}
  } = configOptions

  const typeDefs = getTypeDefs(schemas, imageKeys)

  createTypes(typeDefs)
}

exports.onCreateNode = async ({
  node,
  actions: { createNode, touchNode },
  store,
  cache,
  createNodeId,
}, configOptions) => {
  const {
    imageKeys = ['image']
  } = configOptions

  if (
    imageKeys.includes(node.internal.type)
  ) {
    loadImages({ node, createNode, createNodeId, store, cache, touchNode });
  }
}

exports.sourceNodes = async (
  {
    actions: { createNode },
    createNodeId,
    createContentDigest
  },
  configOptions
) => {
  const {
    url,
    headers,
    rootKey = 'customAPI',
    imageKeys = ['image'],
    schemas = {}
  } = configOptions

  const URL = getUrl(process.env.NODE_ENV, url)
  const data = await fetch(URL, { headers }).then(res => res.json()).catch(err => console.log(err))


  // build entities and correct schemas, where necessary
  let entities = flattenEntities(createNodeEntities({
    name: rootKey,
    data,
    schemas,
    createNodeId
  }))

  // check for problematic keys
  entities = entities.map(entity => ({
    ...entity,
    data: normalizeKeys(entity.data)
  }))

  // build gatsby-node-object
  entities = entities.map(entity => buildNode({ entity, createContentDigest }))

  // render nodes
  entities.forEach((entity) => {
    createNode(entity)
  })
}
