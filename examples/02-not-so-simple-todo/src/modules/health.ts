import { CreateRouteFn } from ".";
import { HttpStatusCode, MinserveResponse } from "../../../../dist";

const createHealthRouter: CreateRouteFn = ({ sequelize }) => {
  return async (request) => {
    if (request.url && /^\/health\/?$/.test(request.url)) {
      type HealthCheckResult = { isHealthy: boolean, error?: string };
      type HealthCheck = { description: string, check: () => HealthCheckResult | Promise<HealthCheckResult> };

      const healthChecks: HealthCheck[] = [
        {
          description: 'Database',
          check: async () => {
            try {
              await sequelize.authenticate();
              return { isHealthy: true };
            } catch (error) {
              return { isHealthy: false, error: JSON.stringify(error) };
            }
          }
        },
      ];

      const health = await Promise.all(healthChecks.map(async (healthCheck) => {
        const { isHealthy, error } = await healthCheck.check();
        return { description: healthCheck.description, isHealthy, error };
      }));

      const isHealthy = health.every((check) => check.isHealthy);

      console.log({ isHealthy, health });

      return {
        statusCode: isHealthy ? HttpStatusCode.OK : HttpStatusCode.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ isHealthy, health })
      } as MinserveResponse;
    }
  };
}

export { createHealthRouter };