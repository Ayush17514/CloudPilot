interface NoOpSpan {
  setAttributes: (attrs: Record<string, any>) => void;
  setStatus: (status: { code: number; message?: string }) => void;
  end: () => void;
}

const noOpSpan: NoOpSpan = {
  setAttributes: () => {},
  setStatus: () => {},
  end: () => {},
};

const noOpTracer = {
  startActiveSpan: async <T>(name: string, fn: (span: NoOpSpan) => T): Promise<T> => {
    return fn(noOpSpan);
  },
};

const phoenixEnabled = process.env.PHOENIX_ENABLED !== "false";

export async function getTracer() {
  if (!phoenixEnabled) {
    return noOpTracer;
  }

  try {
    const phoenixOtel = await import("@arizeai/phoenix-otel");
    const collectorEndpoint = process.env.PHOENIX_COLLECTOR_ENDPOINT || undefined;

    phoenixOtel.register({
      projectName: "cloudpilot-ai",
      ...(collectorEndpoint ? { endpoint: collectorEndpoint } : {}),
    });

    return phoenixOtel.trace.getTracer("cloudpilot-gemini");
  } catch (error: any) {
    console.warn(
      `CloudPilot: ⚠️ Arize Phoenix tracing unavailable (${error?.message || "unknown error"}). Running without tracing.`
    );
    return noOpTracer;
  }
}
