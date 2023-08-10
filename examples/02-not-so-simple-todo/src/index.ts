import { HttpStatusCode, minserve, MinserveRequest } from 'minserve';
import { initModules } from './modules';
import { Sequelize } from 'sequelize-typescript';


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite',
  models: [__dirname + '/**/**/*.model.ts', __dirname + '/**/**/*.model.js'],
  modelMatch: (filename, member) => {
    return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
  },
  logging: (sql) => console.log({ sql })
});

const { router } = initModules({ sequelize });

const server = minserve({
  requestHandler: async (request: MinserveRequest) => {
    console.log({ request });

    const result = await router(request);
    if (result) {
      return result;
    }

    return { statusCode: HttpStatusCode.NOT_FOUND };
  },
});

server.on('close', async () => {
  await sequelize.close();
  console.log('Server closed');
});

server.on('error', async (error: unknown) => {
  await sequelize.close();
  console.error('Server error', error);
});

server.listen(3000, async () => {
  console.log('Server started');
  await sequelize.sync();
});