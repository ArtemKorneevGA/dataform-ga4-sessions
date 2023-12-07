const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/url_extended_preset_input.js");
const {
  rows: result,
} = require("includes/tests/data/url_extended_preset_result.js");

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
  tableName: "sessions_extended_preset",
};

// Unit testing working only for table type
sessions.getConfig = () => {
  return {
    type: "table",
    schema: sessionConfig.dataset,
    tags: [sessionConfig.dataset],
  };
};

// Apply extended preset
sessions.applyPreset("extended");
sessions.addQueryParameters([
  { name: "fbclid" },
  { name: "ttclid" },
  { name: "dclid" },
  { name: "wbraid" },
  { name: "gbraid" },
  { name: "gclid", columnName: "gclid_url" },
]);


// Publish session model
sessions.publish();

// Run tests
test("test_extended_preset")
  .dataset("sessions_extended_preset")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(result));
