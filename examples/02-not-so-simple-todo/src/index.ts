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
  async serverErrorHandler(error) {
    await sequelize.close();
    console.error(error);
  },
  async serverCloseHandler() {
    await sequelize.close();
    console.log('Server closed');
  },
});

server.listen(3000, async () => {
  console.log('Server started');
  await sequelize.sync();
});