const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 2 events have the save event_timestamp, event_name, user_pseudo_id but engagement_time_msec is different

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/form_events_input.js");
const {
  rows: resultStart,
} = require("includes/tests/data/form_start_result.js");
const {
  rows: resultSubmit,
} = require("includes/tests/data/form_submit_result.js");
const {
  rows: resultLead,
} = require("includes/tests/data/generate_lead_result.js");

// Base session config
const eventConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

const ef = new ga4.EventFactory(eventConfig);
// let purchase = ef.createPurchase();
// purchase.publish();
let events = ef.createFormEvents();
// Unit testing working only for table type

events.forEach((event) => {
  event.getConfig = () => {
    return {
      type: "table",
      schema: eventConfig.dataset,
    };
  };

  event.publish();
});

// Run tests
test("test_form_start")
  .dataset("form_start")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(resultStart));

test("test_form_submit")
  .dataset("form_submit")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(resultSubmit));

test("test_generate_lead")
  .dataset("generate_lead")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(resultLead));
