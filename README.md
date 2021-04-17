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

### Custom error messaging

When new teammates attempt to run your codebase, if they haven't created a `.env-unencrypted.env` file, then they will hit an error.

If you want to customise this error message, so your teammates know where to get the file from, you can create a `.dotenv-sync.missing-secret-key` message in your workspace.

For example:

```bash
echo "Check the shared 1Password, in the item titled 'space jam website'" > .dotenv-sync.missing-secret-key
```

## Bundle size

In production-mode, `dotenv-sync` defers entirely to `dotenv`, making it effectively zero in additional bundle size.

## Security

### Is this package secure?

This library encrypts your ENV vars using 256-bit AES.

For reference, this is the same encryption [that 1Password uses](https://1password.com/security). In other words, using this package is cryptographically as secure as storing all of your ENV vars directly in a 1Password vault.

### Why not just commit the ENV vars to source?

If your repo is public, then this is obviously a bad idea, as anyone can e.g. log into your database.

If your repo is private, then this is still a bad idea. All it takes is one person to get hacked, and suddenly the hacker has access to all of your databases. By using this package, even if someone hacks their way to your source-code, they won't be able to decrypt your ENV vars.

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
