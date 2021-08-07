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

We use [ex-gratia](https://www.npmjs.com/package/ex-gratia) to spread the wealth. We use it to share our Google Ad space with contributors like you. Refer to [ex-gratia's Contributor's Guide](https://github.com/svidgen/ex-gratia/blob/HEAD/contributors-guide.md) to get your Google Ads publisher ID into the rotation.
