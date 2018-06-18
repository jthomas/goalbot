const twitter = require('twitter')
const countryEmoji = require('country-emoji')

const handler = async params => {
  const client = new twitter(params.twitter)
  
  const status = content(params.goal, params.teams, params.score)
  console.log('sending tweet:', status)
  await client.post('statuses/update', { status })
}

const goal_line = goal => {
  if (goal.type_of_event === 'goal-own') {
    return `⚽️ OWN GOAL ⚽️`
  } else if (goal.type_of_event === 'goal-penalty') {
    return `⚽️ PENALTY ⚽️`
  }

  return `⚽️ GOAL ⚽️`
}

// england & south korea aren't indexed in the countries list
const flag = team => {
  if (team === 'England') return '󠁿🏴󠁧󠁢󠁥󠁮󠁧󠁿'
  if (team === 'Korea Republic') return '󠁿🇰🇷'
  return countryEmoji.flag(team)
}

const player_line = (goal, teams) => {
  return `👨 ${goal.player} (${flag(teams[goal.team])} ) @ ${goal.time}. 👨`
}

const match_line = (team, score) => {
  return `🏟 ${team.home} ${flag(team.home)} (${score.home}) v ${team.away} ${flag(team.away)} (${score.away}) 🏟`
}

const content = (goal, teams, score) => {
  const lines = [ goal_line(goal), player_line(goal, teams), match_line(teams, score), '#WorldCup']
  return lines.join('\n')
}

exports.handler = handler
