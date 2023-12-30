const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 2 events have the save event_timestamp, event_name, user_pseudo_id but engagement_time_msec is different

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/event_id_input.js");
const { rows: result } = require("includes/tests/data/event_id_result.js");

// Base session config
const eventConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

let event = new ga4.Event(eventConfig);
event.setEventName("form_visibility");

// Unit testing working only for table type
event.getConfig = () => {
  return {
    type: "table",
    schema: eventConfig.dataset,
  };
};

// Publish session model
event.publish();

// Run tests
test("test_event_id")
  .dataset("form_visibility")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(result));
