const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/source_medium_input.js");
const {
  rows: result,
} = require("includes/tests/data/source_ignore_steps_result.js");

// Base session config
const sessionConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

const sessions = new ga4.Sessions(sessionConfig);

// Rename table
sessions.target = {
  tableName: "sessions_ignore_step",
};

// Unit testing working only for table type
sessions.getConfig = () => {
  return {
    type: "table",
    schema: sessionConfig.dataset,
    tags: [sessionConfig.dataset],
  };
};

// Ignore a few processing steps
sessions.skipLastNonDirectStep();
sessions.skipChannelStep();
sessions.skipSourceMediumStep();

// Publish session model
sessions.publish();

// Run tests
const input = rows[0];
const output = result[0];
test(`test_ignore_step`)
  .dataset("sessions_ignore_step")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows([input])
  )
  .expect(helpers.getSqlUnionAllFromRows([output]));
