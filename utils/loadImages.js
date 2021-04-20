const { createRemoteFileNode } = require('gatsby-source-filesystem')

const createImageNode = async ({
  node,
  createNode,
  createNodeId,
  store,
  cache,
  imageName,
  imageCacheKey
}) => {
  let fileNode
  try {
    fileNode = await createRemoteFileNode({
      url: node.url,
      parentNodeId: node.id,
      createNode,
      createNodeId,
      cache,
      store,
    })
  } catch (e) {
    console.log(e)
  }
  if (fileNode) {
    await cache.set(imageCacheKey, {
      fileNodeID: fileNode.id,
      modified: node.modified
    })
    console.log('Image downloaded: ' + imageName)

    node.local___NODE = fileNode.id;
  }
}

const extensionIsValid = (url) => {
  const ext = url.split('.').pop().split('/')[0]
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
      return true
    default:
      return false
  }
}

const loadImages = async ({
  node,
  createNode,
  createNodeId,
  store,
  cache,
  touchNode
}) => {
  if (!node.url) {
    return
  }
  if (!extensionIsValid(node.url)) {
    console.log(`Image-Extension not valid: ${node.url}`)
    return
  }
  const imageName = node.url.match(/([^/]*)\/*$/)[1]
  const imageCacheKey = `local-image-${imageName}`
  const cachedImage = await cache.get(imageCacheKey)
  // If we have cached image and it wasn't modified, reuse
  // previously created file node to not try to redownload
  if (
    cachedImage &&
    node.modified &&
    node.modified === cachedImage.modified
  ) {
    const { fileNodeID } = cachedImage
    touchNode({ nodeId: fileNodeID })
    console.log('Image from Cache: ' + imageName)

    node.local___NODE = fileNodeID
  } else {
    createImageNode({
      node,
      createNode,
      createNodeId,
      store,
      cache,
      imageName,
      imageCacheKey
    })
  }
}

module.exports = loadImages
