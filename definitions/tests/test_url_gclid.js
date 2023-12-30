const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

// 3 tests for each standard rule from sourceMediumRules
const { rows } = require("includes/tests/data/url_gclid_input.js");
const { rows: result } = require("includes/tests/data/url_gclid_result.js");

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
  tableName: "sessions_url_gclid",
};

// Unit testing working only for table type
sessions.getConfig = () => {
  return {
    type: "table",
    schema: sessionConfig.dataset,
    tags: [sessionConfig.dataset],
  };
};

// Add column with query parameter gclid
sessions.addQueryParameters([{ name: "gclid", columnName: "gclid_url" }]);

// Add sourceMediumRule for gclid, the order is matter, if the add new rule at the end it wouldn't work as default source medium rule would be applied
sessions.sourceMediumRules = [{
  columns: ["gclid_url"],
  conditionType: "NOT_NULL",
  conditionValue: "",
  value: {
    source: "'google'",
    medium: "'cpc'",
    campaign: "campaign",
  },
},...sessions.sourceMediumRules];

// Publish session model
sessions.publish();

// Run tests
test("test_url_gclid")
  .dataset("sessions_url_gclid")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(result));
