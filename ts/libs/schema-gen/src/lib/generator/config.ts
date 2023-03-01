import { PolarisConstructor } from '@rm98/core';

/**
 * Configuration options for generating a schema for a particular type.
 */
 export interface SchemaGeneratorConfig {

    /**
     * The TSConfig that should be used for configuring the TypeScript compiler.
     */
    tsConfig: string;

    /**
     * The TypeScript file that constitutes the root of the library that contains the type(s),
     * for which to generate a spec.
     */
    tsIndexFile: string;

    /**
     * The PolarisType, for which to generate the spec.
     */
    polarisType: PolarisConstructor<any>;

}
