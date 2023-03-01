import { KubeConfig } from '@kubernetes/client-node';
import { HorizontalElasticityStrategyKind, initPolarisLib as initCommonMappingsLib } from '@rm98/polaris-common-mappings';
import { Logger } from '@rm98/polaris-core';
import { initPolarisKubernetes } from '@rm98/polaris-kubernetes';
import { HorizontalElasticityStrategyController } from './app/horizontal-elasticity-strategy';

// ToDo: It should be possible to build the elasticity strategy controller easily for multiple orchestrators.

// Load the KubeConfig and initialize the @rm98/polaris-kubernetes library.
const k8sConfig = new KubeConfig();
k8sConfig.loadFromDefault();
const polarisRuntime = initPolarisKubernetes(k8sConfig);

// Initialize the used Polaris mapping libraries
initCommonMappingsLib(polarisRuntime);

// Create an ElasticityStrategyManager and watch the supported elasticity strategy kinds.
const manager = polarisRuntime.createElasticityStrategyManager();
manager.startWatching({
    kindsToWatch: [
        { kind: new HorizontalElasticityStrategyKind(), controller: new HorizontalElasticityStrategyController(polarisRuntime) },
    ],
}).catch(error => {
    Logger.error(error);
    process.exit(1);
});
