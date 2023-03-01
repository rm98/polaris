import {
    CostEfficiencySloMapping,
    CostEfficiencySloMappingSpec,
    HorizontalElasticityStrategyKind,
    RestServiceTarget,
} from '@rm98/common-mappings';
import { ApiObjectMetadata } from '@rm98/core';

export default new CostEfficiencySloMapping({
    metadata: new ApiObjectMetadata({
        namespace: 'default',
        name: 'resource-consumer',
    }),
    spec: new CostEfficiencySloMappingSpec({
        targetRef: new RestServiceTarget({
            group: 'apps',
            version: 'v1',
            kind: 'Deployment',
            name: 'resource-consumer',
        }),
        elasticityStrategy: new HorizontalElasticityStrategyKind(),
        sloConfig: {
            responseTimeThresholdMs: 500,
            targetCostEfficiency: 10,
            minRequestsPercentile: 90,
        },
    }),
});
