const JenkinsAPI = require('../util/jenkins');
const api = new JenkinsAPI({
  host: process.env.JENKINS_HOST,
  port: process.env.JENKINS_PORT
});

const extractGithubHeaders = (req) => {
  return {
    'Content-Type': 'application/json',
    'X-GitHub-Delivery': req.headers['x-github-delivery'],
    'X-GitHub-Event': req.headers['x-github-event'],
    'X-Hub-Signature': req.headers['x-hub-signature']
  };
};

exports.githubToJenkins = async (event, req) => {
  const result = { status: `Ignoring event ${event}`};
  if (event === 'push' || event === 'pull_request') {
    const data = req.body;
    const repository = data.repository.name;
    const author = data.pusher.email;
    result.githubPush = { repository, author };
    try {
      const jenkinsResult = await api.githubWebHook(extractGithubHeaders(req), data);
      result.status = `Processed event ${event}`;
      result.jenkinsResult = jenkinsResult;
    } catch (e) {
      result.status = `Error processing event ${event}`;
      result.error = e.message;
    }
  }
  return result;
};
