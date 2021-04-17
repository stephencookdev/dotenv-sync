# dotenv-sync

This library is a layer on top of [dotenv](https://www.npmjs.com/package/dotenv), that lets you safely and easily share .env files with your team.

It works by encrypting all of your secret ENV vars using a private key, that can then be stored in 1Password, or LastPass etc.

## Set up a project

- `npm install dotenv-sync` to install it
- `$(npm bin)/dotenv-sync --init` to initialise the project

Change your existing code from:

```js
import dotenv from "dotenv";
dotenv.config();
```

to

```js
import dotenv from "dotenv-sync";
dotenv.config();
```

### What to commit

**DO** commit:

- `.env-encrypted` — this file is what keeps your team in sync. It's securely encrypted, and safe to commit publicly

Do **NOT** commit:

- `.env-unencrypted.env` — this file contains all of your secret keys. If you commit this, you might as well not use this library at all and just commit your `.env` directly.

A sample `.gitignore` you might want to use is as follows:

```bash
# .gitignore
*.env
!.env-encrypted
```

## Bundle size

In production-mode, `dotenv-sync` defers entirely to `dotenv`, making it effectively zero in additional bundle size.

## Update ENV vars

To update ENV vars locally just for you, then you should just add to your `.env` file.

To update ENV vars for your team, you can:

- modify the `.env-unencrypted.env` file
- run $(npm bin)/dotenv-sync to update the `.env-encrypted` file
- commit the new `.env-encrypted` file, and push this to source control

## Using ENV vars

### Priority

Anything in your `.env` takes top priority, and will override anything else.

For example, in:

```bash
# .env
TEST=hello

# .env-unencrypted.env
TEST=goodbye
```

then `process.env.TEST === 'hello'`

### Environment groups

The `.env-unencrypted.env` offers groups, as an optional feature. You can specify an active group with the `_ENV_GROUP_TARGET` environment variable.

For example, in:

```bash
# .env
_ENV_GROUP_TARGET=Local

# .env-unencrypted.env
#~~~ Local
TEST=hello

#~~~ Development
TEST=goodbye
```

then `process.env.TEST === 'hello'`
