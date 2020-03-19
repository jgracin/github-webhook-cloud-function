const http = require('http');

class JenkinsAPI {
  constructor(options = {}) {
    this._options = options;
  }

  githubWebHook(headers, data) {
    const httpOptions = this.githubWebHookOptions();
    httpOptions.headers = {...httpOptions.headers, ...headers };
    const postData = JSON.stringify(data);
    return this.postRequest(httpOptions, postData);
  }

  githubWebHookOptions() {
    const {host, port} = this._options;
    return {
      hostname: host,
      port: port,
      path: '/github-webhook/',
      method: 'POST'
    };
  }

  postRequest(options, data) {
    return new Promise((resolve, reject) => {
      const req = http.request(options);
      req.on('response', (res) => {
        resolve({status: res.statusCode, headers: res.headers, messsage: res.statusMessage});
      });
      req.on('error', (e) => {
        reject(e);
      });
      if (data) {
        req.write(data);
      }
      req.end();
    });
  }
}

module.exports = JenkinsAPI;
