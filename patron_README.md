patron - old french source for pattern, also now can mean boss


make it API-first

types/ - represents the meta type model of entities before instantiation during design

lenses/ - represents individual views of the catalog data

catalogs/
categories/
offerings/ - productOfferings
offeringPrices/ - productOfferingPrices
specifications/ - productSpecifications

jobs/import/ - just a type?
jobs/export/ - just a type?

do we want this to become a more general enterprise catalog and not just product catalog?
thats probably more valuable overall
and we can then describe the idea of being able to run multiple instances with alternative configurations that then describes how it can be used as product catalog, or a service catalog, or a resource catalog or all of the above at once potentially

post to /hub creates a listener of a certain type
post to /listener/productSpecificationCreateEvent calls any listener registered for that particular event with the payload

mongodb used as the datastore
* allows us to define a discriminator type for effective inheritance of entities
* Core definitions as one type
* With a validator confirming the applicability based on type in query filter
* Additional valid stores that align to sub types that should apply
* Mongodb has core support for discriminators as well as json schema validators now


We should be able to describe qualification as well somehow
We can use a common rule definition and description language

We go API-first, but we know we will have to really invest in the visual aspects of interacting with the catalog as a whole

* Control the type inheritance hierarchy
* Control the association of entities along with known types (bundling, relies-on etc.)
* Have a distinct separation between Offering and specification structure
* UI visualisation for the fast composition of entities
* Override characteristics, cardinality and associations
* Provide access to retrieve catalog data via API
* Support versioning of entities as they go through edits
* Related to versioning, but also supporting a clear PLM process that should be configurable
* Be able to highlight warnings in the context of a PLM process
    * e.g. removing a char for a new version should warn them of the impact for runtime systems
* Provide standardised meta type definitions for different modes of usage
    * Product Catalog vs Service Catalog vs Resource Catalog vs All-in-one
* Consider providing pre-built models as examples that show how certain commercial offerings may be modelled
* Federation: Allow for easy export of data from one instance and import to another
* Consider how we may utilise git as the backend versioning tool instead of building something custom
* Be ready to consume service catalogs as 'shadow' entities
* Understand how we might consume externally sourced specs as 'shadow' entities
* Allow for providing a combined catalog using us and external catalog data as one single view

