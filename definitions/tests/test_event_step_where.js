const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/source_medium_input.js");
const {
  rows: result,
} = require("includes/tests/data/event_step_where_result.js");

// Base session config
const sessionConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableEventStepWhere: "user_pseudo_id = '950658449.1697698986'",
};

const sessions = new ga4.Sessions(sessionConfig);

// Rename table
sessions.target = {
  tableName: "sessions_event_step_where",
};

// Unit testing working only for table type
sessions.getConfig = () => {
  return {
    type: "table",
    schema: sessionConfig.dataset,
    tags: [sessionConfig.dataset],
  };
};

// Publish session model
sessions.publish();


// Run tests
test("test_event_step_where")
  .dataset("sessions_event_step_where")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(result));
