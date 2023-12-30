const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

const { rows } = require("includes/tests/data/purchase_input.js");
const { rows: result } = require("includes/tests/data/purchase_result.js");

// Base session config
const eventConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

const ef = new ga4.EventFactory(eventConfig);
let purchase = ef.createPurchase();

// Unit testing working only for table type
purchase.getConfig = () => {
  return {
    type: "table",
    schema: eventConfig.dataset,
  };
};

purchase.publish();

// Run tests
test("test_purchase")
  .dataset("purchase")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(result));
