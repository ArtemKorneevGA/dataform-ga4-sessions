const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

const { rows } = require("includes/tests/data/events_with_where.js");
const { rows: result } = require("includes/tests/data/purchase_result.js");

// console.log('rows',rows);

// Base session config
const eventConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableEventStepWhere: "device.category = 'desktop'",
};

const ef = new ga4.EventFactory(eventConfig);
let purchase = ef.createPurchase();

// Rename table
purchase.target = {
  tableName: "event_with_where",
};

// Unit testing working only for table type
purchase.getConfig = () => {
  return {
    type: "table",
  };
};

purchase.publish();

// Run tests
test("test_event_with_where")
  .dataset("event_with_where")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(result));
