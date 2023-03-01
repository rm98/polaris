import { PolarisRuntime } from '@rm98/polaris-core';
import { HorizontalElasticityStrategy, HorizontalElasticityStrategyKind, VerticalElasticityStrategy, VerticalElasticityStrategyKind } from './elasticity';
import { CostEfficiencyMetricMapping } from './metrics';
import { CostEfficiencySloMapping, CpuUsageSloMapping } from './slo';
import { RestServiceTarget } from './slo-targets';

/**
 * Initializes this library and registers its types with the transformer in the `PolarisRuntime`.
 */
export function initPolarisLib(polarisRuntime: PolarisRuntime): void {
    polarisRuntime.transformer.registerObjectKind(new RestServiceTarget(), RestServiceTarget);
    polarisRuntime.transformer.registerObjectKind(new CpuUsageSloMapping().objectKind, CpuUsageSloMapping);
    polarisRuntime.transformer.registerObjectKind(new CostEfficiencySloMapping().objectKind, CostEfficiencySloMapping);
    polarisRuntime.transformer.registerObjectKind(new HorizontalElasticityStrategyKind(), HorizontalElasticityStrategy);
    polarisRuntime.transformer.registerObjectKind(new VerticalElasticityStrategyKind(), VerticalElasticityStrategy);
    polarisRuntime.transformer.registerObjectKind(new CostEfficiencyMetricMapping().objectKind, CostEfficiencyMetricMapping);
}
