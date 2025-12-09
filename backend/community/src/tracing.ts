// tracing.ts - NestJS MSA 구조용
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

let sdk: NodeSDK | null = null;

export function initializeTracing(serviceName: string = 'backend') {
  if (sdk) {
    console.log(`⚠️ OpenTelemetry already initialized for service: ${serviceName}`);
    return;
  }

  try {
    sdk = new NodeSDK({
      serviceName: serviceName,
      traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      }) as any,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
    console.log(`✅ OpenTelemetry initialized for NestJS service: ${serviceName}`);
  } catch (error) {
    console.error('❌ OpenTelemetry initialization failed:', error);
  }
}

export function shutdownTracing() {
  if (sdk) {
    sdk.shutdown();
    sdk = null;
    console.log('✅ OpenTelemetry shutdown complete');
  }
}
