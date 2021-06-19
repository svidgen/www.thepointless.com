Source code for thepointless.com.

# Contributing

Yes. Please do.

We're deployed and hosted with [AWS Amplify](https://docs.amplify.aws/), and built on [wirejs-dom](https://www.npmjs.com/package/wirejs-dom). We use [yarn](https://www.npmjs.com/package/yarn) to get things done. And [webpack](https://www.npmjs.com/package/webpack) for builds.

We don't offer tutorials for those toolsets. Refer to the respective documentation for each as you need to.

Pull the package down. Forgive the cruft. We have a lot of "archived" content left to upgrade. We encourage you to help migrate old content before creating new content.

## Basics

### Get the code

You're lookin' at it. Just [fork](https://github.com/svidgen/www.thepointless.com/fork) it and go `git` your fork.

### Try it out

If you don't have `node`, (including `npm`), you'll need to [install it](https://nodejs.org/en/).

If you don't have `yarn`, install that too:

```
npm i -g yarn
```

And finally, install dependencies and run it:

```
yarn && yarn start
```

This should start the site on [localhost:9999](http://localhost:9999) and automatically open it in your default browser. Changes you make to the source (in `src`) will automatically trigger a rebuild, which should be immediately visible in your browser.


When you're satisfied with your work, commit it, push it, and submit a PR.

## Viewing Your Work

Submit pull requests (PR's) against the `amplify` branch (for now &mdash; this will change soon). The `amplify` branch is published to [dev.thepointless.com](https://dev.thepointless.com), and can be accessed with `dev:devpassword`.

To be clear, that's:

```yaml
Username: dev
Password: devpassword
```

## A Note on Code Quality

We don't have any documented rules just yet. Just try to follow the patterns from the non-archived content, components, and service wrappers. Be receptive to feedback during PR's. We will try not to be terrible, but we reserve the right to steal ideas from your PR's and publish them as our own if you're unable to *reasonably* closely conform our patterns, etc..

And, that's important or two reasons. Firstly, we are potentially the most important dot-com on the planet. Having your name in our git log is super cool.

But secondly, we try to share the wealth with folks in our git log. (Admittedly, not much wealth at the moment ... but, we're getting there!)

And so ...

## Monetization (Getting Paid)

We use [ex-gratia](https://www.npmjs.com/package/ex-gratia) to spread the wealth. We use it to share our Google Ad space with contributors like you. Refer to [ex-gratia's Contributor's Guide](https://github.com/svidgen/ex-gratia/blob/HEAD/contributors-guide.md) to get your Google Ads publisher ID into the rotation.
