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

  const current = await matches.current()
  current.forEach(async match => {
    const match_id = matches.id(match)
    console.log('finding goals for:', match_id)
    const goals = matches.goals(match)
    console.log(`match has ${goals.length} goals:`, goals)

    const previous = await goals_cache.members(match_id)

    if (previous.length) console.log('previous goals from cache:', previous)

    const new_goals = remove(goals, previous)
    if (new_goals.length) {
      console.log(`match has ${new_goals.length} new goals:`, new_goals)
      try {
        for (let goal of new_goals) {
          await publish({ goal, teams: teams(match), score: matches.score(goal, goals)})
        }
        await goals_cache.add_ids(match_id, new_goals) 
      } catch (err) {
        console.log('error publishing new goals', err)
      }
    }
  })
}

exports.handler = handler
