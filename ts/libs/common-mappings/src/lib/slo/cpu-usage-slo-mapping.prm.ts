import { ObjectKind, POLARIS_API, PolarisType, SloCompliance, SloMappingBase, SloMappingInitData, SloMappingSpecBase, initSelf } from '@rm98/core';

/**
 * Configuration for a `CpuUsageSloMapping`.
 */
export interface CpuUsageSloConfig {

    /**
     * The average CPU utilization that should be achieved across all instances of the target.
     */
    targetAvgCPUUtilizationPercentage: number;

}

/**
 * The spec for a `CpuUsageSloMapping`.
 */
export class CpuUsageSloMappingSpec extends SloMappingSpecBase<CpuUsageSloConfig, SloCompliance> {

    constructor(initData?: Partial<CpuUsageSloMappingSpec>) {
        super(initData);
        initSelf(this, initData);
    }

}

/**
 * The CPU Usage SLO allows configuring an average CPU utilization percentage across all instances of a workload.
 */
export class CpuUsageSloMapping extends SloMappingBase<CpuUsageSloMappingSpec> {

    @PolarisType(() => CpuUsageSloMappingSpec)
    spec: CpuUsageSloMappingSpec;

    constructor(initData?: SloMappingInitData<CpuUsageSloMapping>) {
        super(initData);
        this.objectKind = new ObjectKind({
            group: POLARIS_API.SLO_GROUP,
            version: 'v1',
            kind: 'CPUUsageSloMapping',
        });
        initSelf(this, initData);
    }

}
