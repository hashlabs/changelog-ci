'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GithubWrapper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _github = require('github');

var _github2 = _interopRequireDefault(_github);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GithubWrapper = exports.GithubWrapper = function () {
  function GithubWrapper(githubToken, changelogFilename) {
    _classCallCheck(this, GithubWrapper);

    this.githubToken = githubToken;
    this.changelogFilename = changelogFilename;
    this.gh = new _github2.default({
      version: '3.0.0',
      debug: false,
      protocol: 'https',
      host: 'api.github.com',
      pathPrefix: '',
      timeout: 5000,
      headers: {
        'user-agent': 'changelog-ci-bot'
      }
    });

    this.gh.authenticate({
      type: 'oauth',
      token: githubToken
    });
  }

  _createClass(GithubWrapper, [{
    key: 'checkChangelog',
    value: function checkChangelog(_ref) {
      var _this = this;

      var user = _ref.user;
      var repo = _ref.repo;
      var number = _ref.number;

      var page = 1;

      return new Promise(function (resolve, reject) {
        var handler = function handler(files) {
          var filenames = files.map(function (file) {
            return file.filename;
          });

          if (filenames.indexOf(_this.changelogFilename) !== -1) {
            return resolve(true);
          }

          if (filenames.length === 100) {
            page = page + 1;
            console.log('Parsing page ' + page);
            return getPullRequestFiles({ user: user, repo: repo, number: number, page: page }).then(handler);
          }

          resolve(false);
        };

        _this.getPullRequestFiles({ user: user, repo: repo, number: number, page: page }).then(handler);
      });
    }
  }, {
    key: 'getPullRequestFiles',
    value: function getPullRequestFiles(_ref2) {
      var _this2 = this;

      var user = _ref2.user;
      var repo = _ref2.repo;
      var number = _ref2.number;
      var _ref2$page = _ref2.page;
      var page = _ref2$page === undefined ? 1 : _ref2$page;

      var per_page = 100;

      return new Promise(function (resolve, reject) {
        _this2.gh.pullRequests.getFiles({
          user: user,
          repo: repo,
          number: number,
          page: page,
          per_page: per_page
        }, function (err, response) {
          if (err) {
            console.error('getPullRequestFiles error: ', err);
            return reject(err);
          }

          resolve(response);
        });
      });
    }
  }, {
    key: 'createStatus',
    value: function createStatus(_ref3) {
      var _this3 = this;

      var user = _ref3.user;
      var repo = _ref3.repo;
      var sha = _ref3.sha;
      var state = _ref3.state;
      var description = _ref3.description;

      var name = "changelog-ci";

      return new Promise(function (resolve, reject) {
        _this3.gh.repos.createStatus({
          user: user,
          repo: repo,
          sha: sha,
          name: name,
          state: state,
          description: description,
          context: name,
          target_url: 'https://github.com/hashlabs/changelog-ci'
        }, function (err, response) {
          if (err) {
            console.error('createdStatus error: ', err);
            return reject(err);
          }

          resolve(response);
        });
      });
    }
  }]);

  return GithubWrapper;
}();