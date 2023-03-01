import { SloTarget } from '@rm98/core';

/**
 * An `SloTarget` that supports replicas (horizontal scaling).
 */
export class ReplicableTarget extends SloTarget {

    kind: 'Deployment' | 'ReplicaSet' | 'StatefulSet' | 'DaemonSet';

    constructor(initData?: Partial<ReplicableTarget>) {
        super(initData);
    }

}
