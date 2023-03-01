import { KubeConfig } from '@kubernetes/client-node';
import { CostEfficiencySloMapping, CostEfficiencySloMappingSpec, initPolarisLib as initCommonMappingsLib } from '@rm98/common-mappings';
import { Logger, convertToNumber, getEnvironmentVariable } from '@rm98/core';
import { initCostEfficiencyMetrics } from '@rm98/cost-efficiency';
import { initPolarisKubernetes } from '@rm98/kubernetes';
import { initPrometheusQueryBackend } from '@rm98/prometheus';
import { interval } from 'rxjs';
import { CostEfficiencySlo } from './app/cost-efficiency-slo';

// ToDo: It should be possible to build the SLO controller easily for multiple orchestrators.

// Load the KubeConfig and initialize the @rm98/kubernetes library.
const k8sConfig = new KubeConfig();
k8sConfig.loadFromDefault();
const polarisRuntime = initPolarisKubernetes(k8sConfig);

// Initialize the Prometheus query backend.
const promHost = getEnvironmentVariable('PROMETHEUS_HOST') || 'localhost';
const promPort = getEnvironmentVariable('PROMETHEUS_PORT', convertToNumber) || 9090
initPrometheusQueryBackend(polarisRuntime, { host: promHost, port: promPort }, true);

// Initialize the used Polaris mapping libraries
initCommonMappingsLib(polarisRuntime);

// Initialize the composed metrics for computing them within the SLO controller process.
// To retrieve the cost efficiency composed metric from Prometheus instead (i.e., if it is
// computed by a dedicated cost efficiency composed metric controller), comment out the next line.
initCostEfficiencyMetrics(polarisRuntime);

// Create an SloControlLoop and register the factories for the ServiceLevelObjectives it will handle
const sloControlLoop = polarisRuntime.createSloControlLoop();
sloControlLoop.microcontrollerFactory.registerFactoryFn(CostEfficiencySloMappingSpec, () => new CostEfficiencySlo());

// Create an SloEvaluator and start the control loop with an interval read from the SLO_CONTROL_LOOP_INTERVAL_MSEC environment variable (default is 20 seconds).
const sloEvaluator = polarisRuntime.createSloEvaluator();
const intervalMsec = getEnvironmentVariable('SLO_CONTROL_LOOP_INTERVAL_MSEC', convertToNumber) || 20000
Logger.log(`Starting SLO control loop with an interval of ${intervalMsec} milliseconds.`);
sloControlLoop.start({
    evaluator: sloEvaluator,
    interval$: interval(intervalMsec),
});

// Create a WatchManager and watch the supported SLO mapping kinds.
const watchManager = polarisRuntime.createWatchManager();
watchManager.startWatchers([ new CostEfficiencySloMapping().objectKind ], sloControlLoop.watchHandler)
    .catch(error => {
        Logger.error(error);
        process.exit(1);
    });
