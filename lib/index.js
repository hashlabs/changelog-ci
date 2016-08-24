'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _githubWrapper = require('./githubWrapper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _process$env = process.env;
var GITHUB_TOKEN = _process$env.GITHUB_TOKEN;
var CHANGELOG_FILE = _process$env.CHANGELOG_FILE;


if (!CHANGELOG_FILE) {
  CHANGELOG_FILE = 'CHANGELOG.md';
}

if (!GITHUB_TOKEN) {
  console.error('The ci was started without GITHUB_TOKEN env variable');
  console.error('Please add a Github Personal Token as GITHUB_TOKEN env variable');
  process.exit(1);
}

var githubWrapper = new _githubWrapper.GithubWrapper(GITHUB_TOKEN, CHANGELOG_FILE);

var app = (0, _express2.default)();
app.use(_bodyParser2.default.json());

app.get('/', function (req, res) {
  res.send('CHANGELOG CI Running. Go to https://github.com/hashlabs/changelog-ci for more info');
});

app.post('/', function (req, res) {
  var event = req.body;

  var _ret = function () {
    switch (event.action) {
      case 'opened':
      case 'reopened':
      case 'synchronize':
        var user = event.repository.owner.login;
        var repo = event.repository.name;
        var sha = event.pull_request.head.sha;
        var number = event.pull_request.number;

        githubWrapper.createStatus({
          user: user,
          repo: repo,
          sha: sha,
          state: 'pending',
          description: 'Looking for CHANGELOG changes in Pull request'
        });

        return {
          v: githubWrapper.checkChangelog({ user: user, repo: repo, number: number }).then(function (hasChangelog) {
            if (hasChangelog) {
              return githubWrapper.createStatus({
                user: user,
                repo: repo,
                sha: sha,
                description: 'Pull request has CHANGELOG changes',
                state: 'success'
              }).then(function () {
                return res.status(200).send({ success: true });
              }).catch(function (err) {
                return res.status(500).send(err);
              });
            }

            githubWrapper.createStatus({
              user: user,
              repo: repo,
              sha: sha,
              description: "Pull request doesn't have CHANGELOG changes",
              state: 'failure'
            }).catch(function (err) {
              return res.status(500).send(err);
            });
          }).then(function (hasChangelog) {
            res.status(200).send({ success: true });
          }).catch(function (err) {
            return res.status(500).send(err);
          })
        };
    }
  }();

  if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  return res.status(200).send({ success: true });
});

// Start server
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
  console.log('Listening on port', app.get('port'));
});