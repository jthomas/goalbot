# World Cup 2018 Goal Bot - 🌍🏆⚽️🤖

Serverless Twitter bot which tweets out goals from the [2018 FIFA World Cup](https://www.fifa.com/worldcup/).

Serverless application built using [IBM Cloud Functions](https://console.bluemix.net/openwhisk/) ([Apache OpenWhisk](https://github.com/apache/incubator-openwhisk)).

Powers the [WC2018 Goals](https://twitter.com/WC2018_Goals) Twitter account.

![World Cup Goal Tweet](.images/tweet.png?raw=true "World Cup Goal Tweet")

## architecture

This project has two [serverless functions](https://github.com/apache/incubator-openwhisk/blob/master/docs/actions.md) `goal_tracker` and `twitter`. 

`goal_tracker` is connected to an [alarm trigger](https://github.com/apache/incubator-openwhisk-package-alarms) running every sixty seconds. It retrieves all goals for live matches using this [API](http://worldcup.sfg.io/). If new goals are returned, it invokes the `goal` trigger with details.

`twitter` is connected to the `goal` trigger. It takes goal events and sends new tweets using the [Twitter API](https://developer.twitter.com/en/docs/tweets/post-and-engage/overview).

Redis is used to cache goals previously seen by the `goal_tracker` function.

## installation

If you want to deploy this project you will need an instance of the Apache OpenWhisk platform, access to a Redis database and credentials for a Twitter application.

### setup

- Install [The Serverless Framework](https://serverless.com/).

  ```
  npm install serverless
  ```

- Clone [Git repository](https://github.com/jthomas/goalbot).

  ```
  git clone https://github.com/jthomas/goalbot.git
  ```

- Install project dependencies.

  ```
  cd goalbot && npm install
  ```

- Fill in authentication credential for [Redis](https://compose.com/databases/redis) and [Twitter](https://apps.twitter.com/).

  ```json
  {
    "redis": { 
      "host": "XXX",
      "port": "XXX",
      "password": "XXX"
    },
    "twitter": {
      "consumer_key": "XXX",
      "consumer_secret": "XXX",
      "access_token_key": "XXX",
      "access_token_secret": "XXX"
    }
  }
  
  ```

- Run the `deploy` command.

  ```
  serverless deploy
  ```

  