import GitHub from 'github';

export class GithubWrapper {
  constructor(githubToken, changelogFilename) {
    this.githubToken = githubToken;
    this.changelogFilename = changelogFilename
    this.gh = new GitHub({
      version: '3.0.0',
      debug: false,
      protocol: 'https',
      host: 'api.github.com',
      pathPrefix: '',
      timeout: 5000,
      headers: {
        'user-agent': 'changelog-ci-bot',
      }
    });

    this.gh.authenticate({
      type: 'oauth',
      token: githubToken
    });
  }

  checkChangelog({user, repo, number}) {
    let page = 1;

    return new Promise((resolve, reject) => {
      const handler = (files) => {
        const filenames = files.map(file => file.filename);

        if (filenames.indexOf(this.changelogFilename) !== -1) {
          return resolve(true);
        }

        if (filenames.length === 100) {
          page = page + 1;
          console.log(`Parsing page ${page}`);
          return getPullRequestFiles({user, repo, number, page}).then(handler);
        }

        resolve(false);
      }

      this.getPullRequestFiles({user, repo, number, page}).then(handler);
    });
  }

  getPullRequestFiles({user, repo, number, page=1}) {
    const per_page = 100;

    return new Promise((resolve, reject) => {
      this.gh.pullRequests.getFiles({
        user,
        repo,
        number,
        page,
        per_page
      }, (err, response) => {
        if (err) {
          console.error('getPullRequestFiles error: ', err);
          return reject(err);
        }

        resolve(response);
      })
    });
  }

  createStatus({user, repo, sha, state, description}) {
    const name = "changelog-ci";

    return new Promise((resolve, reject) => {
      this.gh.repos.createStatus({
        user,
        repo,
        sha,
        name,
        state,
        description: description,
        context: name,
        target_url: 'https://github.com/hashlabs/changelog-ci'
      }, (err, response) => {
        if (err) {
          console.error('createdStatus error: ', err);
          return reject(err);
        }

        resolve(response);
      })
    })
  }
}
