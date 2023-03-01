# Project Structure

The Polaris project consists of the following components:

* Orchestrator-independent SLO Script core library (`@rm98/polaris-core`)
* Orchestrator-specific SLO Script connectors (currently `@rm98/polaris-kubernetes`)
* SLO Script metrics query API connectors (currently `@rm98/polaris-prometheus`)
* Generic SLO mappings and controllers
* Generic elasticity strategy controllers

The elasticity strategy controllers are currently realized in Go, whereas the other components are realized in TypeScript.
