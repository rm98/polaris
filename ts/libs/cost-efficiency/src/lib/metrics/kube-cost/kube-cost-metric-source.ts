import { TotalCost } from '@rm98/polaris-common-mappings';
import {
    ComposedMetricParams,
    ComposedMetricSourceBase,
    Join,
    LabelFilters,
    LabelGrouping,
    MetricUnavailableError,
    MetricsSource,
    OrchestratorGateway,
    Sample,
} from '@rm98/polaris-core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/**
 * Provides the total cost of a `SloTarget` using KubeCost.
 */
export class KubeCostMetricSource extends ComposedMetricSourceBase<TotalCost> {

    constructor(private params: ComposedMetricParams, metricsSource: MetricsSource, orchestrator: OrchestratorGateway) {
        super(metricsSource, orchestrator);
    }

    getValueStream(): Observable<Sample<TotalCost>> {
        return this.getDefaultPollingInterval().pipe(
            switchMap(() => this.getCost()),
            map(totalCost => ({
                value: totalCost,
                timestamp: new Date().valueOf(),
            })),
        );
    }

    private async getCost(): Promise<TotalCost> {
        const memoryHourlyCostQuery = this.metricsSource.getTimeSeriesSource()
            .select<number>('node', 'ram_hourly_cost');
        const cpuHourlyCostQuery = this.metricsSource.getTimeSeriesSource()
            .select<number>('node', 'cpu_hourly_cost');

        const memoryCostQuery = this.metricsSource.getTimeSeriesSource()
            .select<number>('container', 'memory_working_set_bytes')
            .filterOnLabel(LabelFilters.equal('namespace', this.params.namespace))
            .divideBy(1024)
            .divideBy(1024)
            .divideBy(1024)
            .multiplyBy(memoryHourlyCostQuery, Join.onLabels('node').groupLeft())
            .sumByGroup(LabelGrouping.by('pod'));

        const cpuCostQuery = this.metricsSource.getTimeSeriesSource()
            .select<number>('node', 'namespace_pod_container:container_cpu_usage_seconds_total:sum_rate')
            .filterOnLabel(LabelFilters.equal('namespace', this.params.namespace))
            .multiplyBy(cpuHourlyCostQuery, Join.onLabels('node').groupLeft())
            .sumByGroup(LabelGrouping.by('pod'));

        const totalCostQuery = memoryCostQuery.add(cpuCostQuery)
            .sumByGroup();

        const totalCost = await totalCostQuery.execute();

        if (!totalCost.results || totalCost.results.length === 0) {
            throw new MetricUnavailableError('total cost');
        }

        return {
            currentCostPerHour: totalCost.results[0].samples[0].value,
            accumulatedCostInPeriod: totalCost.results[0].samples[0].value,
        };
    }

}
