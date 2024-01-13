const helpers = require("dataform-ga4-helpers");
const sessionHelpers = require("./includes/helpers");
const { processingSteps } = require("./includes/processing_steps");
const { recommendedEvents } = require("./includes/recommended_events");
for (const funcName in sessionHelpers) {
  if (typeof sessionHelpers[funcName] === "function") {
    helpers[funcName] = sessionHelpers[funcName];
  }
}

const {
  defaultSessionNames,
  sessionPresets,
  defaultSourceMediumRules,
  defaultPostProcessing,
} = require("./includes/constants");

const { defaultAssertions } = require("./includes/assertions");

const bigQueryOptions = [
  "clusterBy",
  "updatePartitionFilter",
  "additionalOptions",
  "partitionExpirationDays",
  "requirePartitionFilter",
];

/**
 * dataform-ga4-sessions module
 * @module dataform-ga4-sessions
 * @typicalname ga4
 * @example
 * ```js
 * const ga4 = require('dataform-ga4-sessions')
 * ```
 */

/**
 * Creates Dataform Action to build GA4 Event tables based on BigQuery exported data.
 * @class
 * @package
 */
class DataformAction {
  /**
   * @param {Object} sourceConfig - GA4 BigQuery Source configuration
   * @param {string} sourceConfig.database - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
   * @param {string} sourceConfig.dataset - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
   * @param {string} sourceConfig.incrementalTableName - Source incremental table name. For example `events_20240101`
   * @param {string} sourceConfig.nonIncrementalTableName - Source non-incremental table name. For example `events_*`
   * @param {string} sourceConfig.incrementalTableEventStepWhere - This property set where condition for the incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
   * @param {string} sourceConfig.nonIncrementalTableEventStepWhere - This property set where condition for the non-incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
   * @param {Object} targetConfig - Optional. Target configuration
   * @param {string} targetConfig.schema - Optional. Target schema name
   * @param {string} targetConfig.tableName - Optional. Target table name
   */
  constructor(sourceConfig, targetConfig) {
    /**
     * @property {Object} source - GA4 BigQuery Source configuration
     * @property {string} source.database - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
     * @property {string} source.dataset - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
     * @property {string} source.incrementalTableName - Source incremental table name. For example `events_20240101`
     * @property {string} source.nonIncrementalTableName - Source non-incremental table name. For example `events_*`
     * @property {string} source.incrementalTableEventStepWhere - This property set where condition for the incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
     * @property {string} source.nonIncrementalTableEventStepWhere - This property set where condition for the non-incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
     */
    this._source = {
      database: sourceConfig.database || dataform.projectConfig.defaultDatabase,
      dataset: sourceConfig.dataset,
      incrementalTableName: sourceConfig.incrementalTableName,
      incrementalTableEventStepWhere:
        sourceConfig.incrementalTableEventStepWhere || false,
      nonIncrementalTableName:
        sourceConfig.nonIncrementalTableName || "events_*",
      nonIncrementalTableEventStepWhere:
        sourceConfig.nonIncrementalTableEventStepWhere || false,
    };
    /**
     * Use getter / setter methods to set values for the following properties.
     * @property {Object} target -  Destination table config.
     * @property {string} target.schema - The target schema. Destination dataset name. Default is dataform_staging
     * @property {string} target.tableName - The target table name. Destination table name.
     * @example
     * ```js
     * session.target = {schema: "dataform_testing", tableName: "test_sessions"}}
     * ```
     */
    this._target = {
      schema:
        targetConfig && targetConfig.schema
          ? targetConfig.schema
          : "dataform_staging",
      tableName:
        targetConfig && targetConfig.tableName ? targetConfig.tableName : null,
    };
    /**
     * @property {string} timezone - The timezone. Default is `Europe/London`
     * @example
     * ```js
     * session.timezone = "Europe/Berlin"
     * ```
     */
    this._timezone = "Europe/London";
    /**
     * @property {string[]} tags - Dataform [execution tags](https://cloud.google.com/dataform/docs/tags) needed to run a chose a set of actions to run. By default `[source.dataset]` tag is added.
     * @example
     * ```js
     * session.tags = ["daily","hourly"]
     * ```
     */
    this._tags = [this._source.dataset];
    /**
     * @property {Array.<{name: String, config: {description: String}, query: function(String):String}>} assertions - List of default [Dataform assertions](https://cloud.google.com/dataform/docs/assertions) for the class, but in most cases if you need extra assertions you could define them outside the class in separate files.
     *
     */
    this._assertions = [];
    /**
     * @property {string} partitionBy - The [partition by])(https://cloud.google.com/dataform/docs/partitions-clusters#create_a_table_partition). Dataform use this keys to generate partitioned tables. By default partitionBy is set to `date`. If you want to use another partitionBy value you need to set it manually.
     * @example
     * ```js
     * session._partitionBy = "DATE(timestamp)"
     * ```
     */
    this._partitionBy = "date";
    /**
     * @property {string} uniqueKey - The [unique key](https://cloud.google.com/dataform/docs/incremental-tables#merge_rows_in_an_incremental_table) for incremental tables. Dataform use this keys to generate merge queries.
     * @example
     * ```js
     * session.uniqueKey = ["session_id","date"]
     * ```
     */
    this._uniqueKey = [];
    /**
     * @property {string[]} clusterBy - The [cluster by](https://cloud.google.com/dataform/docs/partitions-clusters#create_a_table_cluster). Dataform use this keys to generate clustered tables. By default clusterBy is not set. If you want to use clusterBy you need to set it manually.
     * @example
     * ```js
     * session.clusterBy = ["name", "revenue"]
     * ```
     */
    this._clusterBy = undefined;
    /**
     * @property {string} updatePartitionFilter - The [update partition filter](https://cloud.google.com/dataform/docs/incremental-tables#filter_rows_in_an_incremental_table). Dataform use this keys to to avoid scanning the whole table to find matching rows, set updatePartitionFilter to only consider a subset of records. By default updatePartitionFilter is not set. If you want to use updatePartitionFilter you need to set it manually.
     * @example
     * ```js
     * session.updatePartitionFilter = "timestamp >= timestamp_sub(current_timestamp(), interval 24 hour)"
     * ```
     */
    this._updatePartitionFilter = undefined;
    /**
     * @property {Object} additionalOptions - [IBigQueryOptions additionalOptions](https://cloud.google.com/dataform/docs/reference/dataform-core-reference#bigquery). Key-value pairs for the table, view, and materialized view options.
     * @example
     * ```js
     * session.additionalOptions = {numeric_option: "5", string_option: '"string-value"'}
     * ```
     */
    this._additionalOptions = undefined;
    /**
     * @property {number} partitionExpirationDays - [IBigQueryOptions partitionExpirationDays](https://cloud.google.com/dataform/docs/reference/dataform-core-reference#bigquery). The number of days for which BigQuery stores data in each partition. The setting applies to all partitions in a table, but is calculated independently for each partition based on the partition time.
     * @example
     * ```js
     * session.partitionExpirationDays = 90
     * ```
     */
    this._partitionExpirationDays = undefined;
    /**
     * @property {boolean} requirePartitionFilter - [IBigQueryOptions partitionExpirationDays](https://cloud.google.com/dataform/docs/reference/dataform-core-reference#bigquery). Declares whether the partitioned table requires a WHERE clause predicate filter that filters the partitioning column.
     * @example
     * ```js
     * session.requirePartitionFilter = true
     * ```
     */
    this._requirePartitionFilter = undefined;

    bigQueryOptions.forEach((prop) => {
      this[`_${prop}`] = undefined; // Initialize private properties with default values
      Object.defineProperty(this, prop, {
        get: function () {
          return this[`_${prop}`];
        },
        set: function (value) {
          this[`_${prop}`] = value;
        },
      });
    });

    /**
     * @property {Object[]} columns - List of columns from GA4 raw table to be added to the final table. You could check the list of all available columns [here](https://support.google.com/analytics/answer/7029846?hl=en). By default columns are added based on the preset. Or you could add them manually using `addColumns` method.
     * @property {String} columns[].name - Name of the column in GA4 raw table.
     * @property {String} [columns[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as in GA4 raw table.
     */
    this._columns = [];

    /**
     * @property {Object[]} eventParams - List of event params unnested from GA4 raw table event_params column. By default `eventParams` are added based on the preset. You could add your custom event_params using `addEventParams` method.
     * @property {String} eventParams[].name - The value of `key` in the event_params record.
     * @property {String} [eventParams[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `eventParams[].name`.
     * @property {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [eventParams[].type] - Optional. The name of the value in the event_params column. By default `string`.
     */
    this._eventParams = [];
    /**
     * @property {Object[]} userProperties - List of user properties unnested from GA4 raw table user_properties column. By default `userProperties` are not added. You could add your custom user_properties using `addUserProperties` method.
     * @property {String} userProperties[].name - The value of `key` in the user_properties record.
     * @property {String} [userProperties[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `userProperties[].name`.
     * @property {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [userProperties[].type] - Optional. The name of the value in the event_params column. By default `string`.
     */
    this._userProperties = [];

    /**
     * @property {Object[]} queryParameters - List of query parameters from the unnested `event_params` column with the key `page_location`. You could add your custom query_parameters using `addQueryParameters` method.
     * @property {String} queryParameters[].name - The query parameter name.
     * @property {String} [queryParameters[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `queryParameters[].name`.
     */
    this._queryParameters = [];

    /**
     * @property {Object[]} itemColumns - List of child columns to keep in the final table from `items` column. By default `itemColumns` are not added, and if items added as a column all child columns wil be added. You could add itemColumns manually using `addItemColumns` method.
     * @property {String} itemColumns[].name - Name of child column the column in GA4 raw table.
     * @property {String} [itemColumns[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `itemColumns[].name`.
     */
    this._itemColumns = [];

    /**
     * @property {Object[]} itemParams - List of event params of item scope  unnested from GA4 raw table items.item_params column. By default `itemParams` are not added. You could add your custom item_params using `addItemParams` method.
     * @property {String} itemParams[].name - The value of `key` in the items.item_params record.
     * @property {String} [itemParams[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `itemParams[].name`.
     * @property {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [userProperties[].type] - Optional. The name of the value in the event_params column. By default `string`.
     */
    this._itemParams = [];

    const properties = [
      "columns",
      "eventParams",
      "userProperties",
      "queryParameters",
      "itemColumns",
      "itemParams",
    ];

    properties.forEach((prop) => {
      Object.defineProperty(this, prop, {
        get: function () {
          return this[`_${prop}`];
        },
        set: function (value) {
          this.validateEventParams(value);
          items.forEach((item) => {
            if (
              defaultSessionNames.includes(
                item.columnName ? item.columnName : item.name
              )
            ) {
              return;
            }
            this[`_${prop}`].push(item);
          });
        },
      });
    });
  }
  #addItemsToProperty(items, propertyName) {
    this.validateEventParams(items);
    const currentItemNames = this[`_${propertyName}`].map((item) => item.name);
    items.forEach((item) => {
      if (
        defaultSessionNames.includes(
          item.columnName ? item.columnName : item.name
        )
      ) {
        return;
      }
      if (currentItemNames.includes(item.name)) {
        // change item to a new item
        const index = currentItemNames.indexOf(item.name);
        this[`_${propertyName}`][index] = item;
      } else {
        this[`_${propertyName}`].push(item);
      }
      currentItemNames;
    });
  }

  /**
   *
   * @param {Object[]} columns - List of columns from GA4 raw table to be added to the final table.
   * @param {String} columns[].name - Name of the column in GA4 raw table.
   * @param {String} [columns[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as in GA4 raw table.
   * @example
   * ```js
   * session.addColumns([
   * { name: "geo.city", columnName: "city" },
   * { name: "geo.metro", columnName: "metro" },
   * { name: "stream_id" },
   * { name: "platform" },
   * ])
   * ```
   * @description
   * :::warning
   * If you add columns with `RECORD` type, like: `device.*`, `geo.*` you should specify the `columnName`. Because the result column name couldn't have a dot (.) symbol in the name.
   * :::
   */
  addColumns(columns) {
    this.#addItemsToProperty(columns, "columns");
  }
  /**
   * @param {Object[]} eventParams - List of event params unnested from GA4 raw table event_params column.
   * @param {String} eventParams[].name - The value of `key` in the event_params record.
   * @param {String} [eventParams[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `eventParams[].name`.
   * @param {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [eventParams[].type] - Optional. The name of the value in the event_params column. By default `string`.
   * @example
   * ```js
   * session.addUserProperties([
   * { name: "ignore_referrer", type: "string" }
   * ])
   * ```
   */

  addEventParams(eventParams) {
    this.#addItemsToProperty(eventParams, "eventParams");
  }
  /**
   * @param {Object[]} userProperties - List of user properties unnested from GA4 raw table user_properties column.
   * @param {String} userProperties[].name - The value of `key` in the user_properties record.
   * @param {String} [userProperties[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `userProperties[].name`.
   * @param {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [userProperties[].type] - Optional. The name of the value in the event_params column. By default `string`.
   * @example
   * ```js
   * session.addUserProperties([
   * { name: "user_status", type: "string" }
   * ])
   * ```
   */

  addUserProperties(userProperties) {
    this.#addItemsToProperty(userProperties, "userProperties");
  }
  /**
   * @param {Object[]} queryParameters - List of query parameters from the unnested `event_params` column with the key `page_location`.
   * @param {String} queryParameters[].name - The query parameter name.
   * @param {String} [queryParameters[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `queryParameters[].name`.
   * @example
   * ```js
   * session.addUserProperties([
   * { name: "fbclid" },
   * { name: "ttclid" },
   * { name: "gclid", columnName: "gclid_url" },
   * ])
   * ```
   */
  addQueryParameters(queryParameters) {
    this.#addItemsToProperty(queryParameters, "queryParameters");
  }
  /**
   *
   * @property {Object[]} itemColumns - List of child columns to keep in the final table from `items` column. By default `itemColumns` are not added, and if items added as a column all child columns wil be added. You could add itemColumns manually using `addItemColumns` method.
   * @property {String} itemColumns[].name - Name of child column the column in GA4 raw table.
   * @property {String} [itemColumns[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `itemColumns[].name`.
   * @example
   * ```js
   * purchase.addItemColumns([
   * { name: "item_id" },
   * { name: "item_name" },
   * { name: "price" },
   * { name: "quantity" },
   * ])
   * ```
   * @description
   * :::note
   * Supported only in Event class
   * :::
   * In the example below from items columns only `item_id`, `item_name`, `price`, `quantity` will be added to the final table in the `items.item_id`, `items.item_name`, `items.price`, `items.quantity` accordingly.
   */
  addItemColumns(itemColumns) {
    this.#addItemsToProperty(itemColumns, "itemColumns");
  }

  /**
   *
   * @property {Object[]} itemParams - List of names of item-scoped custom dimensions to extract  from `items.item_params` by key.  By default `itemParams` are not added. You could add itemParams manually using `addItemParams` method.
   * @property {String} itemParams[].name - Name of item-scoped custom dimensions.
   * @property {String} [itemParams[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `itemParams[].name`.
   * @param {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [userProperties[].type] - Optional. The type of the value in the `items.item_params` column. By default `string`.
   * @example
   * ```js
   * purchase.addItemParams([
   * { name: "color" , columnName: "item_color"},
   * ])
   * ```
   * @description
   * :::note
   * Supported only in Event class
   * :::
   * In the example below the items.item_params column will be expanded and filtered for the key color. The resulting string values will be stored in items.item_color.
   */
  addItemParams(itemParams) {
    this.#addItemsToProperty(itemParams, "itemParams");
  }

  /**
   * Helper method to generate SQL code to get unique id for each row in a final table, used inside publish method. Should be overwritten in the child class.
   */
  getSqlUniqueId() {}

  get timezone() {
    return this._timezone;
  }
  set timezone(timezone) {
    this._timezone = timezone || "Europe/London";
  }
  get tags() {
    return this._tags;
  }
  set tags(value) {
    if (Array.isArray(value)) {
      this._tags.push(...value);
    } else if (typeof value === "string") {
      this._tags.push(value);
    } else {
      throw new TypeError("Tags should be an array or a string");
    }
  }

  get target() {
    return this._target;
  }
  set target(config) {
    this._target = {
      schema: config.schema || "dataform_staging",
      tableName: config.tableName,
    };
  }

  getConfig() {
    const config = {
      type: "incremental",
      uniqueKey: this._uniqueKey,
      schema: this._target.schema,
      tags: this._tags,
      bigquery: {
        partitionBy: this._partitionBy,
      },
    };
    bigQueryOptions.forEach((prop) => {
      if (this[`_${prop}`]) {
        config.bigquery[prop] = this[`_${prop}`];
      }
    });

    return config;
  }
  get assertions() {
    return this._assertions;
  }
  set assertions(config) {
    if (Array.isArray(value)) {
      this._tags.push(...value);
    } else {
      throw new TypeError("Tags should be an array of assertions");
    }
    this._assertions = config;
  }

  validateEventParams(value) {
    if (!Array.isArray(value)) {
      throw new TypeError("Columns should be an array");
    }

    value.forEach((column) => {
      if (typeof column !== "object" || column === null) {
        throw new TypeError("Each column should be an object");
      }

      // Check if the 'name' property exists and is not an empty string
      if (
        !column.hasOwnProperty("name") ||
        typeof column.name !== "string" ||
        column.name.trim() === ""
      ) {
        throw new TypeError(
          "Each column should have a required 'name' property of string type and it should not be empty"
        );
      }

      if (
        column.hasOwnProperty("columnName") &&
        typeof column.columnName !== "string"
      ) {
        throw new TypeError(
          "Each column should have a 'columnName' property of string type"
        );
      }

      const validTypes = [
        "string",
        "int",
        "double",
        "float",
        "coalesce",
        "coalesce_float",
      ];
      if (
        column.hasOwnProperty("type") &&
        !validTypes.includes(column.type.toLowerCase())
      ) {
        throw new TypeError(
          `Each column should have a 'type' property with one of the following values: ${validTypes.join(
            ", "
          )}`
        );
      }
    });
  }
  /**
   * Main method to publish Dataform Action. This method generates SQL and then uses Dataform core [publish](https://cloud.google.com/dataform/docs/reference/dataform-core-reference#publish) method to generate incremental and non-incremental session table. This method should be overwritten in the child class.
   */
  publish() {}

  /**
   * The method to publish default [Dataform assertions](https://cloud.google.com/dataform/docs/assertions). This method should be overwritten in the child class.
   */
  publishAssertions() {}
}
/**
 * Creates Dataform Action to build GA4 event tables based on BigQuery exported data, for example table for `purchase` events. But instead of using this class directly, it is recommended to use `EventFactory` to create events. The factory could simplify the creation of auto or recommended events. But after the creation of the event, you could use any of `DataformAction` methods and properties.
 * @class
 * @augments DataformAction
 */
class Event extends DataformAction {
  /**
   * Constructor for the Event class inherited from DataformAction class. Before creating the object of this class you need to declare GA4 source tables using `declareSources` method.
   * @param {Object} sourceConfig - GA4 BigQuery Source configuration
   * @param {string} sourceConfig.database - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
   * @param {string} sourceConfig.dataset - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
   * @param {string} sourceConfig.incrementalTableName - Source incremental table name. For example `events_20240101`
   * @param {string} sourceConfig.nonIncrementalTableName - Source non-incremental table name. For example `events_*`
   * @param {string} sourceConfig.incrementalTableEventStepWhere - This property set where condition for the incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
   * @param {string} sourceConfig.nonIncrementalTableEventStepWhere - This property set where condition for the non-incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
   * @param {Object} targetConfig - Optional. Target configuration
   * @param {string} targetConfig.schema - Optional. Target schema name. Default is `dataform_staging`
   * @param {string} targetConfig.tableName - Optional. Target table name.
   * @example
   * ```js
   * // Define your config
   * const eventConfig = {
   * dataset: "analytics_XXXXXX",
   * incrementalTableName: "events_XXXXXX",
   * };
   *
   * // Declare GA4 source tables
   * ga4.declareSources(eventConfig);
   *
   * // Create event
   * let purchase = new ga4.Event(eventConfig);
   *
   * // Set destination table name and add where conditions for the event
   * purchase.setEventName("purchase");
   *```
   */
  constructor(sourceConfig, targetConfig) {
    super(sourceConfig, targetConfig);
    /**
     * @property {string} uniqueKey - The [unique key](https://cloud.google.com/dataform/docs/incremental-tables#merge_rows_in_an_incremental_table) for incremental tables. Dataform use this keys to generate merge queries. Default value for Event is `["date", "event_id"]`
     * @example
     * ```js
     * event.uniqueKey = ["event_id","date"]
     * ```
     */

    this._uniqueKey = ["date", "event_id"];
    /**
     * @property {string} timestampEventParamName - This property will be used to generate unique event_id. The value will be from unnested `event_params` column with the key equals the value of this property. But at first you should add this event parameter in your GTM setup.
     * ```js
     * event.timestampEventParamName = "gtm_event_timestamp"
     * ```
     */
    this._timestampEventParamName = undefined;

    this._skipUniqueEventsStep = false;
  }
  get timestampEventParamName() {
    return this._timestampEventParamName;
  }
  set timestampEventParamName(timestampEventParamName) {
    this._timestampEventParamName = timestampEventParamName;
  }
  /**
   *
   * @property {Object[]} itemColumns - List of child columns to keep in the final table from `items` column. By default `itemColumns` are not added, and if items added as a column all child columns wil be added. You could add itemColumns manually using `addItemColumns` method.
   * @property {String} itemColumns[].name - Name of child column the column in GA4 raw table.
   * @property {String} [itemColumns[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `itemColumns[].name`.
   * @example
   * ```js
   * purchase.addItemColumns([
   * { name: "item_id" },
   * { name: "item_name" },
   * { name: "price" },
   * { name: "quantity" },
   * ])
   * ```
   * @description
   * :::warning
   * If you provide doesn't existing column name in the `itemColumns` list, you will get a SQL error and can't build the table.
   * :::
   * In the example below from items columns only `item_id`, `item_name`, `price`, `quantity` will be added to the final table in the `items.item_id`, `items.item_name`, `items.price`, `items.quantity` accordingly.
   */
  addItemColumns(itemColumns) {
    super.addItemColumns(itemColumns);
  }
  /**
   *
   * @property {Object[]} itemParams - List of names of item-scoped custom dimensions to extract  from `items.item_params` by key.  By default `itemParams` are not added. You could add itemParams manually using `addItemParams` method.
   * @property {String} itemParams[].name - Name of item-scoped custom dimensions.
   * @property {String} [itemParams[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `itemParams[].name`.
   * @param {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [userProperties[].type] - Optional. The type of the value in the `items.item_params` column. By default `string`.
   * @example
   * ```js
   * purchase.addItemParams([
   * { name: "color" , columnName: "item_color"},
   * ])
   * ```
   * @description
   * :::warning
   * item_params were added to the BigQuery export late October 2023. And you can't use addItemParams for events before that date.
   * :::
   * In the example below the items.item_params column will be expanded and filtered for the key color. The resulting string values will be stored in items.item_color.   */
  addItemParams(itemParams) {
    super.addItemParams(itemParams);
  }

  /**
   * Helper method to skip unique events step. By default `where` condition is added to filter all events with `event_id` equals to null. Also `QUALIFY` statement is added to get only one event per `event_id`. But if you want to skip this step you could use this method.
   * @example
   * ```js
   * event.skipUniqueEventsStep();
   * ```
   */
  skipUniqueEventsStep() {
    this._skipUniqueEventsStep = true;
  }

  /**
   * Helper method to generate SQL code to get unique id for each row in a final table, used inside publish method. By default it use getSqlEventId from dataform-ga4-helpers package
   */
  getSqlUniqueId() {
    return helpers.getSqlEventId(this._timestampEventParamName);
  }
  /**
   * This helper method will use event name to define target table and  add where conditions for the final query. It's recommended to use `EventFactory` to create events. But if you want to create event manually you could use this method.
   * @param {string} eventName - The event name. For example `purchase`
   * @example
   * ```js
   * event.setEventName("purchase")
   * ```
   */

  setEventName(eventName) {
    if (!this._target.tableName) this._target.tableName = eventName;
    if (!this._source.incrementalTableEventStepWhere)
      this._source.incrementalTableEventStepWhere = `event_name = '${eventName}'`;
    if (!this._source.nonIncrementalTableEventStepWhere)
      this._source.nonIncrementalTableEventStepWhere = `event_name = '${eventName}'`;
  }

  #getSqlItemParam = (paramName, paramType = "string", columnName = false) =>
    `${helpers.getSqlUnnestParam(
      paramName,
      paramType,
      null,
      "i.item_params"
    )} as ${columnName ? columnName : paramName}`;

  #getSqlItemParams = (itemParams) => {
    const sql = itemParams.map((itemParam) =>
      this.#getSqlItemParam(
        itemParam.name,
        itemParam.type,
        itemParam.columnName
      )
    );
    return itemParams.length > 0 ? sql.join(", ") : "";
  };

  #deleteItemsIfItemsColumnExists(_columns) {
    let columns = [..._columns];
    if (
      (columns.map((item) => item.name).indexOf("items") > -1) &
      (this._itemColumns.length > 0)
    ) {
      columns = columns.filter((item) => item.name !== "items");
    }
    return columns;
  }

  #sqlItemsColumns(itemColumns) {
    return `ARRAY(
      SELECT AS STRUCT ${itemColumns
        .map(
          (item) =>
            `${item.name} as ${item.columnName ? item.columnName : item.name}`
        )
        .join(", ")}
      ${
        this._itemParams.length > 0
          ? `, ${this.#getSqlItemParams(this._itemParams)}`
          : ""
      }
      FROM UNNEST(items) i order by 1 asc
    ) AS items
    `;
  }

  /**
   * Main method to publish Dataform Action. This method generates SQL and then uses Dataform core [publish](https://cloud.google.com/dataform/docs/reference/dataform-core-reference#publish) method to generate incremental and non-incremental session table. This method should be overwritten in the child class.
   * @example
   * ```js
   * purchase.publish()
   * ```
   */

  publish() {
    if (!this._target.tableName) {
      throw new Error("Table name is required, please set target.tableName");
    }
    const events = publish(this._target.tableName, {
      schema: this._target.schema,
    })
      .config(this.getConfig())
      .query(
        (ctx) => `
        
        -- prepare events table
        with events_tbl as (
          select
            ${helpers.getSqlSessionId()},
            ${this.getSqlUniqueId(this._timestampEventParamName)},
            ${helpers.getSqlDate(this._timezone)},
            ${helpers.getSqlEventParam("page_location")},
            TIMESTAMP_MICROS(event_timestamp) as event_timestamp,
            user_id,
            user_pseudo_id,
            ${ctx.when(
              this._columns.length > 0,
              `${helpers.getSqlColumns(
                this.#deleteItemsIfItemsColumnExists(this._columns)
              )}, `
            )}
            ${ctx.when(
              this._eventParams.length > 0,
              `${helpers.getSqlEventParams(this._eventParams)}, `
            )}
            ${ctx.when(
              this._userProperties.length > 0,
              `${helpers.getSqlUserProperties(this._userProperties)}, `
            )}
            ${ctx.when(
              this._queryParameters.length > 0,
              `${helpers.getSqlQueryParameters(
                helpers.getSqlEventParam("page_location", "string", null),
                this._queryParameters
              )}, `
            )}
            ${ctx.when(
              this._itemColumns.length > 0,
              `${this.#sqlItemsColumns(this._itemColumns)}, `
            )}

          from
          ${ctx.when(
            ctx.incremental(),
            `${ctx.ref(
              this._source.database,
              this._source.dataset,
              this._source.incrementalTableName
            )}
            ${
              this._source.incrementalTableEventStepWhere
                ? "WHERE " + this._source.incrementalTableEventStepWhere
                : ""
            }
            `
          )}
          ${ctx.when(
            !ctx.incremental(),
            `${ctx.ref(
              this._source.database,
              this._source.dataset,
              this._source.nonIncrementalTableName
            )}
            ${
              this._source.nonIncrementalTableEventStepWhere
                ? "WHERE " + this._source.nonIncrementalTableEventStepWhere
                : ""
            }
            `
          )}
        )
        ${
          this._skipUniqueEventsStep
            ? ""
            : `, unique_events_tbl as (
          select
          *
          from events_tbl 
          where event_id is not null
           QUALIFY ROW_NUMBER() OVER (
            PARTITION BY event_id
          ) = 1
        )`
        }
        -- select final result from the last processing step and apply post processing
        select
        * ${
          this._postProcessing &&
          this._postProcessing.delete &&
          this._postProcessing.delete.length > 0
            ? `except (${this._postProcessing.delete.join(", ")})`
            : ""
        }
        from ${this._skipUniqueEventsStep ? "events_tbl" : "unique_events_tbl"}
    `
      );
    return events;
  }
}
/**
 * Helper class to create GA4 events. It's recommended to use this class to create events. But if you want to create event manually you could use `Event` class.
 * @class

 */
class EventFactory {
  /**
   * Create any recommended or auto event using EventFactory method like `createEventName`.
   * @param {Object} sourceConfig - GA4 BigQuery Source configuration
   * @param {string} sourceConfig.database - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
   * @param {string} sourceConfig.dataset - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
   * @param {string} sourceConfig.incrementalTableName - Source incremental table name. For example `events_20240101`
   * @param {string} sourceConfig.nonIncrementalTableName - Source non-incremental table name. For example `events_*`
   * @param {string} sourceConfig.incrementalTableEventStepWhere - This property set where condition for the incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
   * @param {string} sourceConfig.nonIncrementalTableEventStepWhere - This property set where condition for the non-incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
   * @example
   * ```js
   * // Define your config
   * const eventConfig = {
   * dataset: "analytics_XXXXXX",
   * incrementalTableName: "events_XXXXXX",
   * };
   *
   * // Define EventFactory
   * const ef = new ga4.EventFactory(eventConfig);
   *
   * // Create purchase event:
   * const purchase = ef.createPurchase();
   *
   * //Publish event
   * purchase.publish()
   * ```
   */
  constructor(sourceConfig) {
    this._source = sourceConfig;

    /**
     * @property {string} timestampEventParamName - This property will be used to generate unique event_id. The value will be from unnested `event_params` column with the key equals the value of this property. But at first you should add this event parameter in your GTM setup.
     * ```js
     * // Define EventFactory
     * const ef = new ga4.EventFactory(eventConfig);
     * // Set timestampEventParamName
     * ef.timestampEventParamName = "gtm_event_timestamp"
     * ```
     */
    this._timestampEventParamName = undefined;

    recommendedEvents.forEach((eventConfig) => {
      this[`create${this.#snakeToCamel(eventConfig.eventName)}`] = () => {
        return this.createEvent(eventConfig);
      };
    });
  }

  get timestampEventParamName() {
    return this._timestampEventParamName;
  }
  set timestampEventParamName(timestampEventParamName) {
    this._timestampEventParamName = timestampEventParamName;
  }

  #snakeToCamel(str) {
    let result = str.replace(/(_\w)/g, function (m) {
      return m[1].toUpperCase();
    });
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  /**
   * @param {Object} eventConfig - Event configuration
   * @param {String} eventConfig.eventName - Event name. For example `purchase`
   * @param {Object} [eventConfig.columns] - List of columns from GA4 raw table to be added to the final table. You could check the list of all available columns [here](https://support.google.com/analytics/answer/7029846?hl=en). By default columns are added based on the preset. Or you could add them manually using `addColumns` method.
   * @param {String} [eventConfig.columns.name] - Name of the column in GA4 raw table.
   * @param {String} [eventConfig.columns.columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as in GA4 raw table.
   * @param {Object} [eventConfig.eventParams] - List of event params unnested from GA4 raw table event_params column. By default `eventParams` are added based on the preset. You could add your custom event_params using `addEventParams` method.
   * @param {String} [eventConfig.eventParams.name] - The value of `key` in the event_params record.
   * @param {String} [eventParams.columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `eventParams.name`.
   * @param {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [eventConfig.eventParams.type] - Optional. The name of the value in the event_params column. By default `string`.
   * @param {Object} [eventConfig.userProperties] - List of user properties unnested from GA4 raw table user_properties column. By default `userProperties` are not added. You could add your custom user_properties using `addUserProperties` method.
   * @param {String} [eventConfig.userProperties.name] - The value of `key` in the user_properties record.
   * @param {String} [eventConfig.userProperties.columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `userProperties.name`.
   * @param {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [eventConfig.userProperties.type] - Optional. The name of the value in the event_params column. By default `string`.
   * @param {Object} [eventConfig.queryParameters] - List of query parameters from the unnested `event_params` column with the key `page_location`. You could add your custom query_parameters using `addQueryParameters` method.
   * @param {String} [eventConfig.queryParameters.name] - The query parameter name.
   * @param {String} [eventConfig.queryParameters.columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `queryParameters[].name`.
   * @returns {Event} Event object
   * @example
   * ```js
   * const purchase = ef.createEvent({
   *  eventName: "session_start",
   *  columns:[{name:"privacy_info.analytics_storage", columnName:"analytics_storage"}],
   *  eventParams:[ { name: "page_referrer", type: "string" }]
   * })
   * ```
   */
  createEvent(eventConfig) {
    let sourceConfig = { ...this._source };
    const whereCondition = `event_name = '${eventConfig.eventName}'`;
    sourceConfig.incrementalTableEventStepWhere =
      sourceConfig.incrementalTableEventStepWhere
        ? sourceConfig.incrementalTableEventStepWhere + ` AND ${whereCondition}`
        : whereCondition;
    sourceConfig.nonIncrementalTableEventStepWhere =
      sourceConfig.nonIncrementalTableEventStepWhere
        ? sourceConfig.nonIncrementalTableEventStepWhere +
          ` AND ${whereCondition}`
        : whereCondition;
    let event = new Event(sourceConfig, { tableName: eventConfig.eventName });
    if (eventConfig.eventParams) event.addEventParams(eventConfig.eventParams);
    if (eventConfig.columns) event.addColumns(eventConfig.columns);
    if (eventConfig.userProperties)
      event.userProperties(eventConfig.userProperties);
    if (eventConfig.queryParameters)
      event.addQueryParameters(eventConfig.queryParameters);
    if (this._timestampEventParamName) {
      event.timestampEventParamName = this._timestampEventParamName;
    }
    return event;
  }
  /**
   * Tne method to create multiple events using list of events configurations. This method is useful if you want to reuse the same event configurations between projects. In this case you could define event configurations in separate file and import the configs and create events using this helper method.
   * @param {Object[]} eventConfig - List of event configurations
   * @param {String} eventConfig[].eventName - Event name. For example `purchase`
   * @param {Object} [eventConfig[].columns] - List of columns from GA4 raw table to be added to the final table. You could check the list of all available columns [here](https://support.google.com/analytics/answer/7029846?hl=en). By default columns are added based on the preset. Or you could add them manually using `addColumns` method.
   * @param {String} [eventConfig[].columns.name] - Name of the column in GA4 raw table.
   * @param {String} [eventConfig[].columns.columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as in GA4 raw table.
   * @param {Object} [eventConfig[].eventParams] - List of event params unnested from GA4 raw table event_params column. By default `eventParams` are added based on the preset. You could add your custom event_params using `addEventParams` method.
   * @param {String} [eventConfig[].eventParams.name] - The value of `key` in the event_params record.
   * @param {String} [eventParams[].columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `eventParams.name`.
   * @param {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [eventConfig[].eventParams.type] - Optional. The name of the value in the event_params column. By default `string`.
   * @param {Object} [eventConfig[].userProperties] - List of user properties unnested from GA4 raw table user_properties column. By default `userProperties` are not added. You could add your custom user_properties using `addUserProperties` method.
   * @param {String} [eventConfig[].userProperties.name] - The value of `key` in the user_properties record.
   * @param {String} [eventConfig[].userProperties.columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `userProperties.name`.
   * @param {'string' | 'int' | 'double' | 'float' | 'coalesce' | 'coalesce_float'} [eventConfig[].userProperties.type] - Optional. The name of the value in the event_params column. By default `string`.
   * @param {Object} [eventConfig[].queryParameters] - List of query parameters from the unnested `event_params` column with the key `page_location`. You could add your custom query_parameters using `addQueryParameters` method.
   * @param {String} [eventConfig[].queryParameters.name] - The query parameter name.
   * @param {String} [eventConfig[].queryParameters.columnName] - Optional. The name of the column in the result table. If not provided the name will be the same as `queryParameters[].name`.
   * @returns {Event[]} List of events
   * @example
   * ```js
   * // Create events
   * let events = ef.createEvents(configs);
   * // Publish events
   * events.forEach(event => event.publish());
   * ```
   */
  createEvents(eventConfigs) {
    return eventConfigs.map((eventConfig) => {
      return this.createEvent(eventConfig);
    });
  }

  #createRecommendedEvents(eventNames) {
    return eventNames.map((eventName) => {
      return this[`create${this.#snakeToCamel(eventName)}`]();
    });
  }
  /**
   * The method to create all recommended ecommerce events.
   * @returns {Event[]} List of events
   * @example
   * ```js
   * // Define your config
   * const eventConfig = {
   * dataset: "analytics_XXXXXX",
   * incrementalTableName: "events_XXXXXX",
   * };
   * // Create all recommended events
   * let events = ef.createEcommerceEvents();
   * // Publish events
   *  events.forEach(event => event.publish());
   * ```
   */
  createEcommerceEvents() {
    const eventNames = [
      "add_payment_info",
      "add_shipping_info",
      "add_to_cart",
      "add_to_wishlist",
      "begin_checkout",
      "generate_lead",
      "purchase",
      "refund",
      "remove_from_cart",
      "view_cart",
      "view_item",
      "view_item_list",
    ];
    return this.#createRecommendedEvents(eventNames);
  }
  /**
   * The method to create all recommended events for form tracking.
   * @returns {Event[]} List of events
   * @example
   * ```js
   * // Define your config
   * const eventConfig = {
   * dataset: "analytics_XXXXXX",
   * incrementalTableName: "events_XXXXXX",
   * };
   * // Create all recommended events
   * let events = ef.createFormEvents();
   * // Publish events
   *  events.forEach(event => event.publish());
   * ```
   */
  createFormEvents() {
    const eventNames = ["generate_lead", "form_start", "form_submit"];
    return this.#createRecommendedEvents(eventNames);
  }
  /**
   * The method to create all recommended and auto events.
   * @returns {Event[]} List of events
   * @example
   * ```js
   * // Define your config
   * const eventConfig = {
   * dataset: "analytics_XXXXXX",
   * incrementalTableName: "events_XXXXXX",
   * };
   * // Create all recommended events
   * let events = ef.createAllRecommendedEvents();
   * // Publish events
   *  events.forEach(event => event.publish());
   * ```
   */
  createAllRecommendedEvents() {
    return this.#createRecommendedEvents(
      recommendedEvents.map((event) => event.eventName)
    );
  }
}
/**
 * Creates Dataform Action to build GA4 Session tables based on BigQuery exported data. The class extends DataformAction class.
 * @class
 * @augments DataformAction
 */
class Session extends DataformAction {
  /**
   * Constructor for the Session class inherited from DataformAction class. And set default values for additional properties needed for the Session Action and also apply `standard` presets. Before creating the object of this class you need to declare GA4 source tables using `declareSources` method.
   * @param {Object} sourceConfig - GA4 BigQuery Source configuration
   * @param {string} sourceConfig.database - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
   * @param {string} sourceConfig.dataset - The GA4 export database name. For example `<YOUR-GCP-PROJECT-ID>`
   * @param {string} sourceConfig.incrementalTableName - Source incremental table name. For example `events_20240101`
   * @param {string} sourceConfig.nonIncrementalTableName - Source non-incremental table name. For example `events_*`
   * @param {string} sourceConfig.incrementalTableEventStepWhere - This property set where condition for the incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
   * @param {string} sourceConfig.nonIncrementalTableEventStepWhere - This property set where condition for the non-incremental queries. The important note this condition is added to the first step, not the final step. So if you filter for example events with source / medium values you could miss this data in the final result. Default is false
   * @param {Object} targetConfig - Optional. Target configuration
   * @param {string} targetConfig.schema - Optional. Target schema name. Default is `dataform_staging`
   * @param {string} targetConfig.tableName - Optional. Target table name. Default is `sessions`
   * @example
   * ```js
   * // Define your config
   * const sessionConfig = {
   * dataset: "analytics_XXXXXX",
   * incrementalTableName: "events_XXXXXX",
   * };
   *
   * // Declare GA4 source tables
   * ga4.declareSources(sessionConfig);
   *
   * // Create sessions object
   * const sessions = new ga4.Session(sessionConfig);
   *```
   */
  constructor(sourceConfig, targetConfig) {
    super(sourceConfig, targetConfig);
    /**
     * @property {string} uniqueKey - The [unique key](https://cloud.google.com/dataform/docs/incremental-tables#merge_rows_in_an_incremental_table) for incremental tables. Dataform use this keys to generate merge queries. Default value for Session is `["date", "session_id"]`
     * @example
     * ```js
     * session.uniqueKey = ["session_id","date"]
     * ```
     */
    this._uniqueKey = ["date", "session_id"];

    /**
     * The order of sourceMediumRules is important, the first rule that meets the condition will be applied.
     * @property {Object[]} sourceMediumRules - The source medium rules. Default is defaultSourceMediumRules from `includes/constants.js`. This property is used to create a source medium columns in the final table.
     * @property {String[]} sourceMediumRules[].columns - The rule will check columns from the list in the final table.
     * @property {'NOT_NULL'} sourceMediumRules[].conditionType - The rule condition type define the logic how to check columns. At the moment only `NOT_NULL` is supported.
     * @property {String} sourceMediumRules[].conditionValue - The rule expected value. Not used by `NOT_NULL` condition type.
     * @property {Object} sourceMediumRules[].value - The value of source medium that should be set in the final table if condition is met.
     * @property {String} sourceMediumRules[].value.source - The source value that should be set. If the value should be literal it should be in the single quotes. For example `"'google'""` otherwise it should be a column name from the final table for example `"source"`.
     * @property {String} sourceMediumRules[].value.medium - The medium value that should be set.
     * @property {String} sourceMediumRules[].value.campaign - The campaign value that should be set.
     * @example
     * ```js
     * sessions.sourceMediumRules = [
     *  {
     *   columns: ["gclid_url"],
     *  conditionType: "NOT_NULL",
     *  conditionValue: "",
     *  value: {
     *   source: "'google'",
     *   medium: "'cpc'",
     *   campaign: "campaign",
     *  },
     * },
     * ...sessions.sourceMediumRules,
     * ];
     * ```
     */
    this._sourceMediumRules = defaultSourceMediumRules;
    /**
     * @property {Object} processingSteps - The post processing config. At the moment only delete is supported.
     * @property {String[]} processingSteps.delete - Columns listed in this property will be deleted from the final table.  By default `[source, medium, campaign]` columns will be delete. Because during `sessions_with_source_medium_and_lp` step and `sessions_with_last_non_direct` these columns also will be added to `last_click_attribution` and `last_non_direct_attribution` accordingly.
     * @example
     * ```js
     * sessions.processingSteps = {
     * delete: ["column2", "column2"],
     * };
     * ```
     */
    this._postProcessing = defaultPostProcessing;

    /**
     * @property {Object[]} processingSteps - The Session Action create a final table in a few steps. Queries for all default steps are defined in `includes/processing_steps.js`. You could skip any of step using methods below or add custom processing steps.
     * @property {String} processingSteps[].queryName - The name of the step. The name should be unique.
     * @property {String} processingSteps[].query - The Function that generates SQL for the step. The function has two parameters `this` and `ctx` which is [Dataform context](https://cloud.google.com/dataform/docs/reference/dataform-core-reference#itablecontext).
     * @description
     *  ### Default session processing steps
     * | Step Name                          | Description                                                                                                                         |
     * | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
     * | events                             | Extract the needed columns from all events. Generate session_id                                                                     |
     * | sessions_base                      | Group events into sessions by session id. Add standard columns like: session_start, session_end, session_engaged, landing_page etc. |
     * | sessions_with_source_medium_and_lp | Apply source / medium rules to create last click attribution                                                                        |
     * | sessions_with_channel              | Add channel grouping based on source / medium                                                                                       |
     * | sessions_with_last_non_direct      | Add last non direct attribution based on lookback window                                                                            |
     */
    this._processingSteps = [...processingSteps];
    /**
     * @property {string} lastNonDirectLookBackWindow - The last non direct look back window, if session has direct source / medium, a sessions_with_last_non_direct processing step tries to find previous non direct sessions inside the look back window. Default is 30 days. This property is used to create a last_non_direct_attribution columns in the final table.
     * @example
     * ```js
     * sessions.lastNonDirectLookBackWindow = 60
     * ```
     */
    this._lastNonDirectLookBackWindow = 30;
    /**
     * @property {Array.<{name: String, config: {description: String}, query: function(String):String}>} assertions - List of default [Dataform assertions](https://cloud.google.com/dataform/docs/assertions) for the class, but in most cases if you need extra assertions you could define them outside the class in separate files.
     * @description
     *  ### Default session assertions
     *  | Name | Description |
     *  |----------------------|------------------------------------------------------------------|
     *  | Sessions Timeliness | Check that we have fresh sessions with a delay of no more than 2 days |
     *  | Sessions Completeness| Check that we have sessions for all days without gaps |
     *  | Sessions Validity | Check that sessions have all the required columns |
     */

    this._assertions = [...defaultAssertions];

    this._target = {
      schema:
        targetConfig && targetConfig.schema
          ? targetConfig.schema
          : "dataform_staging",
      tableName:
        targetConfig && targetConfig.tableName
          ? targetConfig.tableName
          : "sessions",
    };
    // Apply default presets
    this.applyPreset("standard");
  }
  /**
   * The function add list of columns, event_params and user_properties to the final table based on the preset.
   * @param {"standard" | "extended" | "none"} presetName - The name of the preset. The following presets are available: `standard`, `extended`, `none`. Default is `standard`.
   */
  applyPreset(presetName) {
    if (
      presetName !== "none" &&
      !Object.keys(sessionPresets).includes(presetName)
    ) {
      throw new Error(
        `Invalid sessionPresets name. Possible name are: ${Object.keys(
          sessionPresets
        ).join(", ")}`
      );
    } else {
      this._columns = [...sessionPresets[presetName]["columns"]];
      this._eventParams = [...sessionPresets[presetName]["eventParams"]];
      this._userProperties = [...sessionPresets[presetName]["userProperties"]];
    }
  }
  /**
   * Helper method to generate SQL code to get unique id for each row in a final table, used inside publish method. By default it use getSqlSessionId from dataform-ga4-helpers package
   */
  getSqlUniqueId() {
    return helpers.getSqlSessionId();
  }
  get lastNonDirectLookBackWindow() {
    return this._lastNonDirectLookBackWindow;
  }
  set lastNonDirectLookBackWindow(lastNonDirectLookBackWindow) {
    this._lastNonDirectLookBackWindow = lastNonDirectLookBackWindow || 30;
  }
  // TO-DO add validation
  get sourceMediumRules() {
    return this._sourceMediumRules;
  }
  set sourceMediumRules(config) {
    this._sourceMediumRules = config;
  }
  get processingSteps() {
    return this._processingSteps;
  }
  set processingSteps(config) {
    this._processingSteps = config;
  }
  get postProcessing() {
    return this._postProcessing;
  }
  set postProcessing(config) {
    this._postProcessing = config;
  }

  /**
   * The method skips `sessions_with_last_non_direct` processing step.
   * @example
   * ```js
   * sessions.skipLastNonDirectStep();
   * ```
   */
  skipLastNonDirectStep() {
    this._processingSteps = this._processingSteps.filter(
      (step) => step.queryName !== "sessions_with_last_non_direct"
    );
  }
  /**
   * The method skips `sessions_with_channel` processing step. It should be called only after `skipLastNonDirectStep` as it depends on it. Also if this method is called a table with channels definitions created by `helpers.getSqlSourceCategoriesTable` wouldn't be added.
   * @example
   * ```js
   * sessions.skipLastNonDirectStep();
   * sessions.skipChannelStep();
   * ```
   */

  skipChannelStep() {
    if (
      this._processingSteps.filter(
        (step) => step.queryName == "sessions_with_last_non_direct"
      ).length > 0
    ) {
      throw new Error(
        `Last direct step can't be skipped as it's required by following steps. Please delete last direct attribution step first.`
      );
    }
    this._processingSteps = this._processingSteps.filter(
      (step) => step.queryName !== "sessions_with_channel"
    );
  }

  /**
   * The method skip `sessions_with_source_medium_and_lp` processing step. This method should be used if you want to create your own source / medium attribution logic. The order is important as each step uses the preceding step. So you can't skip the channel step and have a last_non_direct step. But you could delete all the steps, and add your own processing steps.
   * @example
   * ```js
   * // Ignore all processing steps except the first
   * sessions.skipLastNonDirectStep();
   * sessions.skipChannelStep();
   * sessions.skipSourceMediumStep();
   * ```
   */
  skipSourceMediumStep() {
    if (
      this._processingSteps.filter(
        (step) => step.queryName == "sessions_with_channel"
      ).length > 0
    ) {
      throw new Error(
        `Last direct step can't be skipped as it's required by following steps. Please delete channel step first.`
      );
    }
    if (
      this._processingSteps.filter(
        (step) => step.queryName == "sessions_with_last_non_direct"
      ).length > 0
    ) {
      throw new Error(
        `Last direct step can't be skipped as it's required by following steps. Please delete last direct attribution step first.`
      );
    }

    this._processingSteps = this._processingSteps.filter(
      (step) => step.queryName !== "sessions_with_source_medium_and_lp"
    );
  }
  /**
   * Main method to publish Dataform Action. This method generates SQL and then uses Dataform core [publish](https://cloud.google.com/dataform/docs/reference/dataform-core-reference#publish) method to generate incremental and non-incremental session table.
   * @example
   * ```js
   * session.publish()
   * ```
   */
  publish() {
    if (!this._target.tableName) {
      throw new Error("Table name is required, please set target.tableName");
    }
    const sessions = publish(this._target.tableName, {
      schema: this._target.schema,
    })
      .config(this.getConfig())
      .query(
        (ctx) => `
        
        -- prepare events table
        with events as (
          select
            ${this.getSqlUniqueId()},
            ${helpers.getSqlDate(this._timezone)},
            TIMESTAMP_MICROS(event_timestamp) as event_timestamp,
            user_id,
            user_pseudo_id,
            COALESCE(
                (SELECT value.int_value FROM unnest(event_params) WHERE key = "session_engaged"),
                (CASE WHEN (SELECT value.string_value FROM unnest(event_params) WHERE key = "session_engaged") = "1" THEN 1 END)
            ) as session_engaged,            
            ${helpers.getSqlEventParam("page_location")},
            ${helpers.getSqlEventParam("page_referrer")},
            ${helpers.getSqlEventParam("ignore_referrer")},
            ${helpers.getSqlEventParam("source")},
            ${helpers.getSqlEventParam("medium")},
            ${helpers.getSqlEventParam("campaign")},
            ${helpers.getSqlEventParam("gclid")},
            ${ctx.when(
              this._columns.length > 0,
              `${helpers.getSqlColumns(this._columns)}, `
            )}
            ${ctx.when(
              this._eventParams.length > 0,
              `${helpers.getSqlEventParams(this._eventParams)}, `
            )}
            ${ctx.when(
              this._userProperties.length > 0,
              `${helpers.getSqlUserProperties(this._userProperties)}, `
            )}
            ${ctx.when(
              this._queryParameters.length > 0,
              `${helpers.getSqlQueryParameters(
                helpers.getSqlEventParam("page_location", "string", null),
                this._queryParameters
              )}, `
            )}

          from
          ${ctx.when(
            ctx.incremental(),
            `${ctx.ref(
              this._source.database,
              this._source.dataset,
              this._source.incrementalTableName
            )}
            ${
              this._source.incrementalTableEventStepWhere
                ? "WHERE " + this._source.incrementalTableEventStepWhere
                : ""
            }
            `
          )}
          ${ctx.when(
            !ctx.incremental(),
            `${ctx.ref(
              this._source.database,
              this._source.dataset,
              this._source.nonIncrementalTableName
            )}
            ${
              this._source.nonIncrementalTableEventStepWhere
                ? "WHERE " + this._source.nonIncrementalTableEventStepWhere
                : ""
            }
            `
          )}


        )
        
        -- add source_categories table if channel step is required
        ${
          this._processingSteps
            .map((step) => step.queryName)
            .includes("sessions_with_channel")
            ? `, source_categories as (
                    ${helpers.getSqlSourceCategoriesTable()}
                )`
            : ""
        }

        -- add processing steps
        ${
          this._processingSteps.length > 0
            ? "," +
              this._processingSteps
                .map((processingStep) => processingStep.query(this, ctx))
                .join(",\n")
            : ""
        }
       
        -- select final result from the last processing step and apply post processing
        select
        * ${
          this._postProcessing &&
          this._postProcessing.delete &&
          this._postProcessing.delete.length > 0
            ? `except (${this._postProcessing.delete.join(", ")})`
            : ""
        }
        from ${
          this._processingSteps.length > 0
            ? this._processingSteps[this._processingSteps.length - 1].queryName
            : "events"
        }
  `
      );

    return sessions;
  }

  /**
   * The method to publish default [Dataform assertions](https://cloud.google.com/dataform/docs/assertions).
   * @example
   * ```js
   * session.publishAssertions()
   * ```
   */
  publishAssertions() {
    if (!this._target.tableName) {
      throw new Error("Table name is required, please set target.tableName");
    }
    // Add assertions based on this._assertions
    this._assertions &&
      this._assertions.forEach((assertion) => {
        const config = assertion.config;
        config.tags = ["assertions", this._source.dataset];
        assert(
          `${assertion.name}_${this._target.schema}_${this._target.tableName}`
        )
          .config(config)
          .query((ctx) =>
            assertion.query(
              ctx.ref({
                name: this._target.tableName,
              })
            )
          );
      });
  }
}

module.exports = {
  declareSources: helpers.declareSources,
  Session,
  Event,
  EventFactory,
};
