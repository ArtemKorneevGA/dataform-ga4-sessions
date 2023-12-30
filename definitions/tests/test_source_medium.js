const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/source_medium_input.js");
const { rows: result } = require("includes/tests/data/source_medium_result.js");

// Base session config
const sessionConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

const sessions = new ga4.Session(sessionConfig);

// Rename table
sessions.target = {
  tableName: "sessions_source_medium",
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
for (let index = 0; index < rows.length; index++) {
  const input = rows[index];
  const output = result[index];
  test(`test_source_medium_${index}`)
    .dataset("sessions_source_medium")
    .input(
      {
        database: constants.GA4_DATABASE,
        schema: dataform.projectConfig.vars.GA4_DATASET,
        name: dataform.projectConfig.vars.GA4_TABLE,
      },
      helpers.getSqlUnionAllFromRows([input])
      )
    .expect(helpers.getSqlUnionAllFromRows([output]));
}
