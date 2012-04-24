# Proxstagram

An experiment in node.js, express.js, and Instagram running on Heroku
using less.js.

## WHat does it do?

The idea was simple: I wanted to put a bit of JS on my blog to show my
latest few instagram photos. I just wanted thumbnails. The problem I ran
into was that Instagram requires authentication to get to a users
photostream, even if that user is marked as public. So, that would imply
that any JS only solution would require the OAuth tokens to be in the
clear in the JavaScript code. That seemed like a bad idea.

So, here's a simple proxy that lets you sign up, OAuth to Instagram, and
get an opaque API key. The API key only lets a client READ from the API
call, and only the most recent 30 photos. This should be safe. The
actual OAuth credentials that give you full access to the Instagram API
will remain on the server.

## What is it built with?

This is still a work in progress, but so far, we're using:

- node.js
- express.js
- less.js
- Bootstrap by Twitter

## License

See the LICENSE file for details.
