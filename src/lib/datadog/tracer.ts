import { isTesting } from '@/utils/environment';
import tracer from 'dd-trace';

export const startTracer = () => {
  if (isTesting()) return;

  tracer.init({
    service: process.env.DD_SERVICE,
    env: process.env.DD_ENV,
    version: process.env.DD_VERSION,
    logInjection: true,
    runtimeMetrics: true,
  });
};

export default tracer;
