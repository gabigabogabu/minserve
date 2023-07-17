# minserve
`minserve` is a minimal http server.
It only accepts a single request handler (and some optional other handlers).
The only thing it does is provide an abstraction layer that parses requests and sends responses.

I'm open to: 
- making sure the http verb is valid and parse it into an enum
- add explicit parsing for special headers such as cookies, auth or others

## Dependencies
- node >=14

## TODO
0. https
1. examples
2. websockets?

## Usage

```ts
import { minserve } from 'minserve';

const server = minserve({
    requestHandler: async (request) => {
        return { body: 'hello world' }
    })
});

server.listen(3000, () => { console.log('Server started') });
```