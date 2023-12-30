const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 2 events have the save event_timestamp, event_name, user_pseudo_id but engagement_time_msec is different

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/form_events_input.js");

const {
  rows: resultSessionStart,
} = require("includes/tests/data/session_start_result.js");

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

const sessionStartConfig = [
  {
    eventName: "session_start",
    columns: [
      {
        name: "privacy_info.analytics_storage",
        columnName: "analytics_storage",
      },
    ],
    eventParams: [{ name: "engagement_time_msec", type: "int" }],
  },
  {
    eventName: "generate_lead",
    eventParams: [
      { name: "value", type: "coalesce_float" },
      { name: "currency", type: "string" },
    ],
  },
];

const ef = new ga4.EventFactory(eventConfig);
let events = ef.createEvents(sessionStartConfig);
events.forEach((event) => {
  event.target = {
    tableName: event.target.tableName + "_create_test",
  };
  event.getConfig = () => {
    return {
      type: "table",
      schema: eventConfig.dataset,
    };
  };

  event.publish();
});

// Run tests
test("test_create_session_start")
  .dataset("session_start_create_test")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(resultSessionStart));

test("test_create_generate_lead")
  .dataset("generate_lead_create_test")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(resultLead));
