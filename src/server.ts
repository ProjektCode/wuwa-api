import { buildApp } from "./app";
import { getConfig } from "./config";

async function main(): Promise<void> {
  const config = getConfig();
  const app = await buildApp(config);

  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`listening on http://${config.host}:${config.port}`);
    app.log.info("docs available at /docs");
  } catch (err) {
    app.log.error(err);
    process.exitCode = 1;
  }
}

void main();
