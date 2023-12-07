const ga4 = require("index");

const tablesDefinition = {
    dataset: dataform.projectConfig.vars.GA4_DATASET,
    incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

ga4.declareSources(tablesDefinition)