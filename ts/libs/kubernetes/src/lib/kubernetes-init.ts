import { KubeConfig } from '@kubernetes/client-node';
import { ApiObject, ContainerResources, Logger, ObjectKind, PolarisRuntime, initPolarisRuntime } from '@rm98/polaris-core';
import { KubernetesPolarisRuntime } from './runtime';
import { ApiObjectTransformer, ContainerResourcesTransformer, KubernetesDefaultTransformer, ObjectKindTransformer } from './transformation';

/**
 * Initializes the Kubernetes Polaris runtime and sets it as the global singleton.
 *
 * @param kubeConfig The Kubernetes configuration that should be used to configure the `KubernetesPolarisRuntime`.
 */
export function initPolarisKubernetes(kubeConfig: KubeConfig): PolarisRuntime {
    Logger.log('Initializing Kubernetes connector with KUBECONFIG:', kubeConfig);
    const runtime = new KubernetesPolarisRuntime(kubeConfig);
    registerTransformers(runtime);
    initPolarisRuntime(runtime);
    return runtime;
}

function registerTransformers(runtime: PolarisRuntime): void {
    runtime.transformer.changeDefaultTransformer(new KubernetesDefaultTransformer());

    // Registering ObjectKindTransformer as inheritable for the ObjectKind class makes it available for ObjectReference, SloTarget, and OwnerReference as well.
    runtime.transformer.registerTransformer(ObjectKind, new ObjectKindTransformer(), { inheritable: true });

    runtime.transformer.registerTransformer(ApiObject, new ApiObjectTransformer<any>(), { inheritable: true });
    runtime.transformer.registerTransformer(ContainerResources, new ContainerResourcesTransformer(), { inheritable: true });
}
