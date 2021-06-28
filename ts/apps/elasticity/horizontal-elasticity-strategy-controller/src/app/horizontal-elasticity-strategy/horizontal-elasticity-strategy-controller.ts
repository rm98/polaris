import { HorizontalElasticityStrategyConfig } from '@polaris-sloc/common-mappings';
import {
    ElasticityStrategy,
    NamespacedObjectReference,
    OrchestratorClient,
    PolarisRuntime,
    SloCompliance,
    SloComplianceElasticityStrategyControllerBase,
    SloTarget,
} from '@polaris-sloc/core';

/**
 * Controller for executing a `HorizontalElasticityStrategy`.
 */
export class HorizontalElasticityStrategyController extends SloComplianceElasticityStrategyControllerBase<SloTarget, HorizontalElasticityStrategyConfig> {

    private orchClient: OrchestratorClient;

    constructor(private polarisRuntime: PolarisRuntime) {
        super();
        this.orchClient = polarisRuntime.createOrchestratorClient();
    }

    async execute(elasticityStrategy: ElasticityStrategy<SloCompliance, SloTarget, HorizontalElasticityStrategyConfig>): Promise<void> {
        console.log('Executing elasticity strategy:', elasticityStrategy);

        const targetRef = new NamespacedObjectReference({
            namespace: elasticityStrategy.metadata.namespace,
            ...elasticityStrategy.spec.targetRef,
        });
        const scale = await this.orchClient.getScale(targetRef);

        const multiplier = elasticityStrategy.spec.sloOutputParams.currSloCompliancePercentage / 100;
        let newReplicaCount = Math.ceil(scale.spec.replicas * multiplier);
        newReplicaCount = Math.max(newReplicaCount, this.getMinReplicas(elasticityStrategy.spec.staticConfig));
        newReplicaCount = Math.min(newReplicaCount, this.getMaxReplicas(elasticityStrategy.spec.staticConfig));

        if (scale.spec.replicas === newReplicaCount) {
            console.log(
                'No scaling possible, because new replica count after min/max check is equal to old replica count.',
                scale,
            );
        }

        scale.spec.replicas = newReplicaCount;
        await this.orchClient.setScale(targetRef, scale);
        console.log('Successfully updated scale subresource:', scale);
    }

    private getMinReplicas(config: HorizontalElasticityStrategyConfig): number {
        return config?.minReplicas ?? 1;
    }

    private getMaxReplicas(config: HorizontalElasticityStrategyConfig): number {
        return config?.maxReplicas ?? Infinity;
    }

}
