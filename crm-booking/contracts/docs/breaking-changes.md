# Breaking changes policy

Contracts use semantic versioning.

## Compatible changes

These changes may be released in a minor or patch version:

- adding optional request fields;
- adding response fields;
- adding new endpoints;
- adding new event types;
- adding optional event fields;
- documenting error codes without changing existing meanings.

## Breaking changes

These changes require a new major version:

- removing or renaming endpoints;
- removing request or response fields;
- making an optional field required;
- changing field type, format or enum meaning;
- changing HTTP status codes for an existing outcome;
- removing event types;
- removing event fields;
- changing event names, versions or required metadata;
- changing authentication or internal-token expectations.

## Review rule

Every pull request that changes `public/*.openapi.json` or `public/*-events.schema.json` must include:

- a changelog entry;
- consumer impact notes;
- migration notes when a breaking change is intentional.
