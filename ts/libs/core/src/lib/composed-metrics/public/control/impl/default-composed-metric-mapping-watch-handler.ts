import { ComposedMetricMapping, ComposedMetricMappingSpec, ObjectKind, SloTarget } from '../../../../model';
import { WatchEventsHandler } from '../../../../orchestrator';
import { executeSafely } from '../../../../util';
import { ComposedMetricComputationConfig, ComposedMetricsManager } from '../composed-metrics-manager';

/**
 * Concrete `WatchEventsHandler` subinterface for `ComposedMetricMappings`.
 */
export interface ComposedMetricMappingWatchEventsHandler extends WatchEventsHandler<ComposedMetricMapping> {}


/**
 * {@link ComposedMetricsManager} extension that allows adding and removing composed metric mappings.
 */
export interface ModifiableComposedMetricsManager extends ComposedMetricsManager {

    /**
     * Adds the specified {@link ComposedMetricMapping} to this manager to periodically compute the metric.
     *
     * @param mapping The {@link ComposedMetricMapping} to be added.
     * @param computationConfig The {@link ComposedMetricComputationConfig} for the mapping's composed metric type.
     */
    addComposedMetricMapping(mapping: ComposedMetricMapping, computationConfig: ComposedMetricComputationConfig): void

    /**
     * Removes the {@link ComposedMetricMapping} with the specified `key`.
     *
     * @param key The {@link ComposedMetricMapping} to be deleted (identified through its metadata).
     */
    removeComposedMetricMapping(mapping: ComposedMetricMapping): void

}

/**
 * Receives watch events for a {@link ComposedMetricMapping} and communicates them to the `ComposedMetricsManager`.
 *
 * If `supportedSloTargetKinds` is configured on the {@link ComposedMetricComputationConfig}, only mappings
 * with matching `SloTarget` types will be passed to the `ComposedMetricsManager`.
 */
export class DefaultComposedMetricMappingWatchEventsHandler implements ComposedMetricMappingWatchEventsHandler {

    /**
     * If set, only ComposedMetricMappings that have one of these object kinds will be passed on,
     * the others will be ignored.
     */
    private supportedSloTargetKinds?: Set<string>;

    /**
     * Creates a new `DefaultComposedMetricMappingWatchEventsHandler`.
     *
     * @param manager The {@link ModifiableComposedMetricsManager} that should be triggered by this watch events handler.
     * @param computationConfig The {@link ComposedMetricComputationConfig} that should be supplied with every mapping.
     */
    constructor(
        private manager: ModifiableComposedMetricsManager,
        private computationConfig: ComposedMetricComputationConfig<any>,
    ) {
        if (computationConfig.supportedSloTargetKinds && computationConfig.supportedSloTargetKinds.length > 0) {
            this.supportedSloTargetKinds = new Set();
            computationConfig.supportedSloTargetKinds.forEach(
                kind => this.supportedSloTargetKinds.add(ObjectKind.stringify(kind)),
            );
        }
    }

    onObjectAdded(obj: ComposedMetricMapping<ComposedMetricMappingSpec<any, SloTarget>>): void {
        executeSafely(() => {
            if (this.isSloTargetSupported(obj.spec.targetRef)) {
                this.manager.addComposedMetricMapping(obj, this.computationConfig);
            }
        });
    }

    onObjectModified(obj: ComposedMetricMapping<ComposedMetricMappingSpec<any, SloTarget>>): void {
        executeSafely(() => {
            this.manager.removeComposedMetricMapping(obj);
            this.manager.addComposedMetricMapping(obj, this.computationConfig);
        });
    }

    onObjectDeleted(obj: ComposedMetricMapping<ComposedMetricMappingSpec<any, SloTarget>>): void {
        executeSafely(() => this.manager.removeComposedMetricMapping(obj));
    }

    private isSloTargetSupported(target: SloTarget): boolean {
        if (this.supportedSloTargetKinds) {
            const targetStr = ObjectKind.stringify(target);
            return this.supportedSloTargetKinds.has(targetStr);
        }
        return true;
    }

}
