interface AppConfiguration {
  port: number;
  webOrigin: string;
}

export function configuration(): { app: AppConfiguration } {
  return {
    app: {
      port: Number(process.env.API_PORT ?? 3000),
      webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    },
  };
}

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const port = Number(config.API_PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('API_PORT must be a valid TCP port.');
  }
  return config;
}
