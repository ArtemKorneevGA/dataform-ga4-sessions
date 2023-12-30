const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 2 events have the save event_timestamp, event_name, user_pseudo_id but engagement_time_msec is different

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/custom_event_id_input.js");
const {
  rows: result,
} = require("includes/tests/data/custom_event_id_result.js");

// Base session config
const eventConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

let event = new ga4.Event(eventConfig);
event.setEventName("form_visibility");

event.target = {
  tableName: "custom_event_id_tbl",
};
// Unit testing working only for table type
event.getConfig = () => {
  return {
    type: "table",
    schema: eventConfig.dataset,
  };
};

event.getSqlUniqueId = () => {
  return `(select value.int_value from unnest(event_params) where key = 'ga_session_id') as event_id`;
};
// Publish session model
event.publish();

// Run tests
test("test_custom_event_id")
  .dataset("custom_event_id_tbl")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(result));
