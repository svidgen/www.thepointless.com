# Contributing

Pull the package down. Forgive the cruft. Make awesome new things!

"New things" could be:

1. An "article" that is on-topic. Or off topic? We don't know.
1. A poem or other collection of adjacent words.
1. A game!
1. A quiz!
1. Clickbait!
1. A pyramid scheme!
1. A site forum.
1. Upgraded old content (from the `archive` folder)
1. Almost literally anything you can think of.

## Basics

### Get the code

You're lookin' at it. Just [fork](https://github.com/svidgen/www.thepointless.com/fork) it and go `git` your fork.

### Try it out

If you don't have `node`, (including `npm`), you'll need to [install it](https://nodejs.org/en/).

To install deps and start your local dev server:

```
npm i && npm run start
```

*Or*, if you have `yarn` installed:

```
yarn && yarn start
```

This should start the site on [localhost:9999](http://localhost:9999) and automatically open it in your default browser. Changes you make to the source (in `src`) will automatically trigger a rebuild. There's no auto-refresh in the browser. (Click the refresh button to see your changes.)

When you're satisfied with your work, commit it, push it, and submit a PR.

### Backend development

We're deployed and hosted with [AWS Amplify](https://docs.amplify.aws/), and built on [wirejs-dom](https://www.npmjs.com/package/wirejs-dom). We use [yarn](https://www.npmjs.com/package/yarn) to get things done. And [webpack](https://www.npmjs.com/package/webpack) for builds.

We don't have any of Amplify's wonderful backend integrations enabled yet. But, the plan *is* to do so. We'll get there when we get there.

If you have an idea that depends on some backend stuff and can explain what resources you need, [submit an issue](https://github.com/svidgen/www.thepointless.com/issues). If your idea isn't *terrible*, we'll try to make time to get your resources set up.

## Viewing Your Work

You're welcome to submit small or isolated changes against `master`.

Large, complex, or "risky" pull requests can be submitted against the `amplify` branch. The `amplify` branch is published to [dev.thepointless.com](https://dev.thepointless.com). This allows for some testing extended QA prior to promotion to production.

You can log into [dev.thepointless.com](https://dev.thepointless.com) with:

```yaml
Username: dev
Password: devpassword
```

## Package Structure 

| Folder | Purpose |
|---|---|
| /amplify | files used by the aws amplify framework for back-end services and hosting |
| /archive | files from the pre-aws migration, php version of site. pull requests to migrate this content will generally be welcome and appreciated. |
| /dist | built files. not to be added to the repository. |
| /node_modules | node modules, managed by npm. not to be added. |
| /scripts | CLI scripts that may be used during development, building, etc.. |
| /src | content and script that must be "built" for deployment |
| /src/components | [wirejs-dom](https://www.npmjs.com/package/wirejs-dom) web components intended to be used across pages |
| /src/layouts | top-level layouts into which route content (.md and .html files) are embedded. |
| /src/lib | common javascript modules that are *not* `wirejs-dom` components |
| /src/routes | routable paths. `.md` and `.html` files herein produce human-navigable URLs. |
| /static | content that will be deployed as-is. |
| /static/images | images that are deployed statically, as-is. |

## A Note on Code Quality

We don't have any documented rules just yet. Just try to follow the patterns from the non-archived content, components, and service wrappers. Be receptive to feedback during PR's. We will try not to be terrible, but we reserve the right to steal ideas from your PR's and publish them as our own if you're unable to *reasonably* closely conform our patterns, etc..

And, that's important or two reasons. Firstly, we are potentially the most important dot-com on the planet. Having your name in our git log is super cool.

But secondly, we try to share the wealth with folks in our git log. (Admittedly, not much wealth at the moment ... but, we're getting there!)

And so ...

## Monetization (Getting Paid)

We use [ex-gratia](https://www.npmjs.com/package/ex-gratia) to spread the wealth by sharing our Google Ad space with contributors like you. (Also planned: Amazon affiliates link sharing!) Refer to [ex-gratia's Contributor's Guide](https://github.com/svidgen/ex-gratia/blob/HEAD/contributors-guide.md) to get your Google Ads publisher ID into the rotation.

## Other ways to contribute

You can also contribute by [submitting and commenting on issues](https://github.com/svidgen/www.thepointless.com/issues).

* Ideas for new pages / features
* Bug reports
* Asking for help with the development process
* Saying "Hi."

And of course, you could also just give us money. (Link pending.)