export type AppConfig = {
  port: number;
  host: string;
  dataRoot: string;
  imagesRoot: string;
};

export function getConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const port = Number(env.PORT ?? 3000);
  const host = env.HOST ?? "0.0.0.0";

  return {
    port: Number.isFinite(port) ? port : 3000,
    host,
    dataRoot: env.DATA_ROOT ?? "assets/data",
    imagesRoot: env.IMAGES_ROOT ?? "assets/images",
  };
}
