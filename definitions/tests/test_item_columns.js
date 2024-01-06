const ga4 = require("index");
const helpers = require("dataform-ga4-helpers");

const { rows } = require("includes/tests/data/purchase_input.js");
const { rows: result } = require("includes/tests/data/item_columns_result.js");

// Base session config
const eventConfig = {
  database: constants.GA4_DATABASE,
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
  nonIncrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

const ef = new ga4.EventFactory(eventConfig);
let purchase = ef.createPurchase();
purchase.addItemColumns([
  { name: "item_id" },
  { name: "item_name" },
  { name: "price" },
  { name: "quantity" },
]);
// Unit testing working only for table type
purchase.getConfig = () => {
  return {
    type: "table",
    schema: eventConfig.dataset,
  };
};
purchase.target = {
  tableName: "item_columns_tbl",
};
purchase.publish();

// console.log(helpers.getSqlUnionAllFromRows(rows));

// Run tests
test("test_item_columns")
  .dataset("item_columns_tbl")
  .input(
    {
      database: constants.GA4_DATABASE,
      schema: dataform.projectConfig.vars.GA4_DATASET,
      name: dataform.projectConfig.vars.GA4_TABLE,
    },
    helpers.getSqlUnionAllFromRows(rows)
  )
  .expect(helpers.getSqlUnionAllFromRows(result));
