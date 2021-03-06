const github = require('./util/github');
const HTTPError = require('./util/httpError');
const { githubToJenkins: handler } = require('./handler/githubToJenkins');

/**
 * HTTP Cloud Function for GitHub Webhook events.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} res Cloud Function response context.
 */
exports.githubWebhookHandler = async (req, res) => {
  try {
    if (!req || !res || !req.method) {
      throw new HTTPError(400);
    }

    if (req.method !== 'POST') {
      console.info(`Rejected ${req.method} request from ${req.ip} (${req.headers['user-agent']})`);
      throw new HTTPError(405, 'Only POST requests are accepted');
    }
    console.info(`Received request from ${req.ip} (${req.headers['user-agent']})`);

    // No need to verify that this request came from GitHub because Jenkins
    // will do that anyway.
    // github.validateWebhook(req);

    const githubEvent = req.headers['x-github-event'];
    const event = await handler(githubEvent, req);
    console.log(event);
    res.send(event);
  } catch (e) {
    if (e instanceof HTTPError) {
      res.status(e.statusCode).send(e.message);
      console.info(`HTTP ${e.statusCode}: ${e.message}`);
    } else {
      res.status(500).send(e.message);
      console.error(`HTTP 500: ${e.message}`);
    }
  }
};
