const fs = require('fs')
const fetch = require('node-fetch')
const matches_today = 'http://worldcup.sfg.io/matches/today' 

const current = async () => {
  const res = await fetch(matches_today)
  const body = await res.json()
  return body
}

const time_sort = (a, b) => parseInt(a.time, 10) - parseInt(b.time, 10)

const goal_events = (events = []) => events.filter(e => e.type_of_event.startsWith('goal'))

const goals = match => {
  const home_goals = goal_events(match.home_team_events).map(goal => {
    goal.team = 'home'
    return goal
  })
  const away_goals = goal_events(match.away_team_events).map(goal => {
    goal.team = 'away'
    return goal
  })

  // return list of all goals in the game ordered by time.
  return home_goals.concat(away_goals).sort(time_sort)
}

const goal_team = goal => {
  if (goal.type_of_event === 'goal-own') {
    return goal.team === 'home' ? 'away' : 'home'
  }
  return goal.team 
}

// given a list of all the goals, work out actual score at goal.
const score = (at, goals) => {
  const position = goals.indexOf(at)
  const scored = goals.slice(0, position + 1)

  const initial = { home: 0, away: 0 }
  const score = scored.reduce((score, goal) => {
    const team = goal_team(goal)
    score[team] += 1
    return score
  }, initial)

  return score
}

// home & away teams may meet again in the final? use datetime in cacheid to make unique.
const id = match => `${match.datetime} ${match.home_team.code}v${match.away_team.code}`

exports.current = current
exports.goals = goals
exports.score = score
exports.id = id
