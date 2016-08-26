# changelog-ci

changelog-ci monitors pull requests and checks if the pull request includes changes to the CHANGELOG. We use this at Hash Labs to make sure every change in the code has an entry in the CHANGELOG.

![image](https://s11.postimg.org/mm0kuhg2b/Screen_Shot_2016_08_24_at_4_52_21_PM.png)

## How To Use?

- Go to
 - your project on GitHub > Settings > Webhooks & services > Add Webhook or
 - your organization on GitHub > Settings > Webhooks > Add Webhook
- Payload URL: (https://changelog-ci.herokuapp.com/)
- Let me select individual events > Check `Pull Request`
- Add Webhook

And you are done. Next time a pull request is opened, you should see the pending status from changelog-ci ;)

## How to run your own bot?

If you want to use a different account for the bot, change something or to access private repos, we've tried to make it super easy:

```
git clone https://github.com/hashlabs/changelog-ci.git
cd changelog-ci
npm install
npm run compile
env GITHUB_TOKEN=<github-token> CHANGELOG_FILE=<changelog-file-name> npm start
```

Alternatively you can deploy the bot using Heroku by pressing the button below:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## License

changelog-ci is Copyright © 2016 Hash Labs. Check for [LICENSE](/LICENSE.md) for more details.

## About Hash Labs

![hash labs logo](https://www.hashlabs.com/images/hashlabs_logo_horizontal_02.png)

CHANGELOG CI is maintained and funded by [Hash Labs LLC](https://www.hashlabs.com)
