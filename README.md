<p align="center">
      <img src="img/logo.png" alt="dataform-ga4-sessions logo" width="150px" />
</p>

# dataform-ga4-sessions

`dataform-ga4-sessions` is a Dataform package to prepare session and event tables from Google Analytics 4 (GA4) BigQuery raw data.

[Documentation](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/) •
[How to create a session table](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/sessions/create-session) •
[How to create event tables](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/events/create-event) •
[Dataform Basics](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/guides/dataform) •
[Dataform scheduling](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/guides/scheduling-daily) •
[API Reference](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/api) •
[Contributing](#contributing)

## Features

- An easy and fast way to create a session and events table from GA4 raw data without writing SQL
- Get session source/medium, campaign, and other traffic source dimensions
- Get session default channel grouping by the rules close to GA4 definitions
- By default, you get two attribution models: last click and last non direct click
- Base session assertions: timeliness, completeness, validity
- Set a result session table schema: standard or extended
- Highly customizable: add your own columns, processing steps, source medium rules etc.
- Unit tests for the main cases
- Event class to create event tables from GA4 raw data
- Events factory to create recommended and auto events

## Quick start

https://github.com/ArtemKorneevGA/dataform-ga4-sessions/assets/30120916/a639292e-2069-48c4-aa91-d6d2842b7795

1. Initialize a new Dataform project and initialize development workspace following the instructions [here](https://cloud.google.com/dataform/docs/quickstart-create-workflow).

2. Add `dataform-ga4-sessions` to your project dependencies in `package.json`.

For example your `package.json` could look like this:

```json
{
  "name": "my-dataform-project",
  "dependencies": {
    "@dataform/core": "2.6.7",
    "dataform-ga4-sessions": "https://github.com/ArtemKorneevGA/dataform-ga4-sessions/archive/refs/tags/v1.0.1.tar.gz"
  }
}
```

You could find the package's latest version [here](https://github.com/ArtemKorneevGA/dataform-ga4-sessions/releases).

And click "Install packages" in the Dataform web UI.

3. Add the following code to your `definitions/ga4.js` file:

```javascript
const ga4 = require("dataform-ga4-sessions");

// Define your config
const config = {
  dataset: "analytics_XXXXXX",
  incrementalTableName: "events_XXXXXX",
};

// Declare GA4 source tables
ga4.declareSources(config);
// Create sessions object
const sessions = new ga4.Session(config);
// Publish session table
sessions.publish();
// Publish session assertions
sessions.publishAssertions();

// Create event factory object
const ef = new ga4.EventFactory(config);
// Create all recommended form tracking events
let events = ef.createEcommerceEvents();
// Publish events
events.forEach((event) => event.publish());
```

Execute all actions. As a result in the current GCP project in dataset `dataform_staging` the package generates the following tables:

- sessions
- add_payment_info, add_shipping_info, add_to_cart, add_to_wishlist, begin_checkout, generate_lead, purchase, refund, remove_from_cart, view_cart, view_item, view_item_list

## The main concepts

The main goal of the package is to simplify processing of GA4 BigQuery data. Instead of writing custom SQL, the package provides a set of JavaScript classes that generate Dataform actions (SQL and configuration) to create sessions and events tables.

There are a few main concepts behind the package:

- In **sessions** table the package stores only session scope features, like source/medium, geo, device and etc. Each session should have a unique `session_id` column.
- Each needed event is collected in separate table (Dataform action). In **events** tables the package stores only event scope features, default and custom. Each event should have a unique `event_id` column.
- If for event (like purchase) you need session scope dimensions (like source/medium) you could always join sessions and events tables by `session_id` column.
- **sessions** and **events** tables are incremental tables. And Dataform will generate merge statements to update them. Read more about Dataform [main concepts](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/guides/dataform) and how to [run daily updates](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/guides/scheduling-daily).
- All reporting tables should use **sessions** and **events** tables as a source instead of GA4 raw data. In the next releases, package will provide a set of base reporting actions: landing page report, traffic sources, events, and etc.
- Package provides a few variants of schemas for sessions table. And schemas for all recommended and auto events tables. But you could easily customize schemas, using helpers method.
- Package doesn't have processing steps for normalization (aka star schema). In most cases for small and medium datasets it's not necessary. As it doesn't reduce cost but increases complexity. If needed you could add your own processing steps or fork the package.
- Package provides a set of assertions to check sessions. You could use them as a base for data quality assurance.

## Next steps

- [Refresh Dataform basics](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/guides/dataform)
- [Read how to update session and event tables daily](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/guides/scheduling-daily)
- [How to create session table](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/sessions/create-session)
- [More about event tables](https://ArtemKorneevGA.github.io/dataform-ga4-sessions/events/create-event)

## Requirements

The package depends on `@dataform/core` and [dataform-ga4-helpers](https://github.com/ArtemKorneevGA/dataform-ga4-helpers) - Dataform package with helper methods.

## License

`dataform-ga4-sessions` is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! The project goal is to create `dataform-ga4-sessions` and `dataform-ga4-events` packages and based on them create packages to generate tables needed for all standard UA and GA4 reports.

## Contact Information

For help or feedback, please contact me on [LinkedIn](https://www.linkedin.com/in/artem-korneev/).
