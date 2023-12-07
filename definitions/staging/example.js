const ga4 = require("index");

// Define sessions model config based on dataform.json vars
const sessionConfig = {
  dataset: dataform.projectConfig.vars.GA4_DATASET,
  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,
};

// Create new sessions model object
const sessions = new ga4.Sessions(sessionConfig);

//
sessions.publish();
sessions.publishAssertions();
