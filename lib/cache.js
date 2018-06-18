'use strict';

const redis = require("redis")
 
let client = null

const cache = options => {
  if (!client) {
    client = redis.createClient(options)

    client.on('error', err => {
      console.error('Error from Redis', err)
      throw err
    })

    client.on('ready', () => {
      console.log('Connected to Redis')
    })
  }

  const get = key => {
    return new Promise((resolve, reject) => {
      client.smembers(key, (err, members) => {
        if (err) return reject(err)
        resolve(members)
      })
    })
  }

  const add = (key, members) => {
    return new Promise((resolve, reject) => {
      client.sadd(key, members, (err, amount) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const members = async id => {
    const ids = await get(id)
    return ids.map(id => parseInt(id, 10))
  }

  const add_ids = async (key, parents) => {
    const ids = parents.map(parent => parent.id)
    await add(key, ids) 
  }

  return { members, add_ids } 
}

module.exports = cache
