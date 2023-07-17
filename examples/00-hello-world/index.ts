import { minserve } from 'minserve';

const server = minserve({
    requestHandler: async (request) => {
        return { body: 'Hello world!' };
    }
});

server.listen(3000, () => { console.log('Server started') });