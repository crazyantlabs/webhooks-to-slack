# webhooks-to-slack

A Node.js app to deliver Webhooks to Slack incoming webhooks.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone https://github.com/crazyantlabs/webhooks-to-slack.git # or clone your own fork
$ cd webhooks-to-slack
$ export WEBHOOK_AUTH_HEADER="<Optional Webhook auth header>"
$ export SLACK_WEBHOOK_URL="<Slack incoming webhook URL>"
$ export SLACK_CHANNEL="<Optional Slack channel name>"
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku main
$ heroku config:set WEBHOOK_AUTH_HEADER="<Optional Webhook auth header>"
$ heroku config:set SLACK_WEBHOOK_URL="<Slack incoming webhook URL>"
$ heroku config:set SLACK_CHANNEL="<Optional Slack channel name>"
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Slack templates

We use Mustache to render Slack message templates. The templates are just a simple JS object under `lib/slack-message-templates.js`.
