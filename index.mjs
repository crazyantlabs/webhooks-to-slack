import {fromPayload, send} from './lib/slack-message.mjs';

import * as url from 'url';
import bodyParser from 'body-parser';
import express from 'express';
import * as path from 'path';
const PORT = process.env.PORT || 5000;

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(url.fileURLToPath(import.meta.url), 'public')))

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const webhookAuthHeader = process.env.WEBHOOK_AUTH_HEADER;
  if (authHeader) {
      if( webhookAuthHeader === authHeader ) {
        next()
      } else {
        res.sendStatus(401);
      }
  } else {
    res.sendStatus(401);
  }
}

app.post('/', authenticate, async function (req, res) {
  const url = process.env.SLACK_WEBHOOK_URL;
  const channel = process.env.SLACK_CHANNEL;
  const message = fromPayload(req.body);
  const response = await send(url, message);

  res.send(await response.text())
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
