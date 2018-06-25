'use strict';

const openwhisk = require('openwhisk')

const cache = require('./cache.js')
const twitter = require('./twitter.js')
const matches = require('./matches.js')

const remove = (goals, previous) => goals.filter(goal => !previous.includes(goal.id))

const teams = match => ({ home: match.home_team.country, away: match.away_team.country })

const publish = async params => {
  const name = 'goal'
  const ow = openwhisk()
  await ow.triggers.invoke({name, params})
}

const handler = async params => {
  const goals_cache = cache(params.redis)

  console.log('retrieving current goals...')
  const current = await matches.current()
  console.log(`api returned ${current.length} matches`)

  for (let match of current) {
    const match_id = matches.id(match)
    console.log('finding goals for:', match_id)
    const goals = matches.goals(match)
    console.log(`match has ${goals.length} goals:`, goals)

    const previous = await goals_cache.members(match_id)

    if (previous.length) console.log('previous goals from cache:', previous)

    const new_goals = remove(goals, previous)
    if (new_goals.length) {
      console.log(`match has ${new_goals.length} new goals:`, new_goals)
      for (let goal of new_goals) {
        await publish({ goal, teams: teams(match), score: matches.score(goal, goals)})
      }
      await goals_cache.add_ids(match_id, new_goals) 
    }
  }
}

// wrap handler to manually propagate errors due to:
// https://github.com/apache/incubator-openwhisk-runtime-nodejs/issues/63
const err_handler = async params => {
  try {
    const result = await handler(params)
    return result
  } catch (err) {
    console.error(err)
    return { error: err.message }
  }
}

exports.handler = err_handler
