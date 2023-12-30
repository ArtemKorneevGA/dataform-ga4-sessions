const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 2 events have the save event_timestamp, event_name, user_pseudo_id but engagement_time_msec is different

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/form_events_input.js");
const {
  rows: resultStart,
} = require("includes/tests/data/event_id_with_event_param_result.js");

// Base session config
const eventConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

const ef = new ga4.EventFactory(eventConfig);
// Just for testing purposes
ef.timestampEventParamName = "engagement_time_msec";

// let purchase = ef.createPurchase();
// purchase.publish();
let events = ef.createFormEvents();
// Unit testing working only for table type

const event = events.filter((ev) => ev._target.tableName === "form_submit")[0];

event.target = {
  tableName: "form_submit_event_id_test",
};
event.getConfig = () => {
  return {
    type: "table",
    schema: eventConfig.dataset,
  };
};

event.publish();

// Run tests
test("test_event_id_with_event_param")
  .dataset("form_submit_event_id_test")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows([rows[0]])
  )
  .expect(helpers.getSqlUnionAllFromRows(resultStart));
