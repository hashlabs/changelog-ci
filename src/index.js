import express from 'express';
import bodyParser from 'body-parser';
import { GithubWrapper } from './githubWrapper';

let { GITHUB_TOKEN, CHANGELOG_FILE } = process.env;

if (!CHANGELOG_FILE) {
  CHANGELOG_FILE = 'CHANGELOG.md';
}

if (!GITHUB_TOKEN) {
  console.error('The ci was started without GITHUB_TOKEN env variable');
  console.error('Please add a Github Personal Token as GITHUB_TOKEN env variable');
  process.exit(1);
}

const githubWrapper = new GithubWrapper(GITHUB_TOKEN, CHANGELOG_FILE);

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('CHANGELOG CI Running. Go to https://github.com/hashlabs/changelog-ci for more info');
});

app.post('/', (req, res) => {
  var event = req.body

  switch (event.action) {
    case 'opened':
    case 'reopened':
    case 'synchronize':
      const user = event.repository.owner.login;
      const repo = event.repository.name;
      const sha = event.pull_request.head.sha;
      const number = event.pull_request.number;

      githubWrapper.createStatus({
        user,
        repo,
        sha,
        state: 'pending',
        description: 'Looking for CHANGELOG changes in Pull request'
      });

      return githubWrapper.checkChangelog({user, repo, number})
        .then((hasChangelog) => {
          if (hasChangelog) {
            return githubWrapper.createStatus({
              user,
              repo,
              sha,
              description: 'Pull request has CHANGELOG changes',
              state: 'success'
            })
            .then(() => res.status(200).send({success: true}))
            .catch((err) => res.status(500).send(err));
          }

          githubWrapper.createStatus({
            user,
            repo,
            sha,
            description: "Pull request doesn't have CHANGELOG changes",
            state: 'failure'
          }).catch((err) => res.status(500).send(err));
        }).then((hasChangelog) => {
          res.status(200).send({success: true});
        }).catch((err) => res.status(500).send(err))
  }

  return res.status(200).send({success: true})
});

// Start server
app.set('port', process.env.PORT || 3000)

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'))
})
