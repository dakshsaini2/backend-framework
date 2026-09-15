import pino from "pino";

/**
 * Create a configured Pino logger instance.
 *
 * @param options.level - Log level (default: from LOG_LEVEL env var or 'info')
 * @param options.pretty - Enable pretty printing (default: true in development)
 */
export function createLogger(options?: { level?: string; pretty?: boolean }) {
  const level = options?.level ?? process.env.LOG_LEVEL ?? "info";
  const isPretty = options?.pretty ?? process.env.NODE_ENV !== "production";

  if (isPretty) {
    return pino({
      level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    });
  }

  return pino({ level });
}

/** Default logger instance */
export const logger = createLogger();
