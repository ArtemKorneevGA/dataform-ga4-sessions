const helpers = require("dataform-ga4-helpers");
const sessionHelpers = require("includes/helpers");
const { processingSteps } = require("includes/processing_steps");
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
} = require("includes/constants");

const { defaultAssertions } = require("includes/assertions");

const bigQueryOptions = [
  "clusterBy",
  "updatePartitionFilter",
  "additionalOptions",
  "partitionExpirationDays",
  "requirePartitionFilter",
];
class Sessions {
  constructor(config) {
    this._source = {
      database: config.database || dataform.projectConfig.defaultDatabase,
      dataset: config.dataset,
      incrementalTableName: config.incrementalTableName,
      incrementalTableEventStepWhere:
        config.incrementalTableEventStepWhere || false,
      nonIncrementalTableName: config.nonIncrementalTableName || "events_*",
      nonIncrementalTableEventStepWhere:
        config.nonIncrementalTableEventStepWhere || false,
    };
    this._target = {
      schema: "dataform_staging",
      tableName: "sessions",
    };
    this._timezone = "Europe/London";
    this._tags = [this._source.dataset];
    this._sourceMediumRules = defaultSourceMediumRules;
    this._postProcessing = defaultPostProcessing;
    this._processingSteps = [...processingSteps];
    this._assertions = [...defaultAssertions];
    this._LastNonDirectLookBackWindow = 30;

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

    const properties = [
      "columns",
      "eventParams",
      "userProperties",
      "queryParameters",
    ];

    properties.forEach((prop) => {
      this[`_${prop}`] = []; // Initialize private properties with default values

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

      // Define add methods for each property
      this[`add${prop.charAt(0).toUpperCase() + prop.slice(1)}`] = function (
        items
      ) {
        this.validateEventParams(items);
        const currentItemNames = this[`_${prop}`].map((item) => item.name);
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
            this[`_${prop}`][index] = item;
          } else {
            this[`_${prop}`].push(item);
          }
          currentItemNames;
        });
      };
    });

    // Apply default presets
    this.applyPreset("standard");
  }

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

  get timezone() {
    return this._timezone;
  }
  set timezone(timezone) {
    this._timezone = timezone || "Europe/London";
  }
  get LastNonDirectLookBackWindow() {
    return this._LastNonDirectLookBackWindow;
  }
  set LastNonDirectLookBackWindow(LastNonDirectLookBackWindow) {
    this._LastNonDirectLookBackWindow = LastNonDirectLookBackWindow || 30;
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
      tableName: config.tableName || "sessions",
    };
  }

  getConfig() {
    const config = {
      type: "incremental",
      uniqueKey: ["date", "session_id"],
      schema: this._target.schema,
      tags: this._tags,
      bigquery: {
        partitionBy: "date",
      },
    };
    bigQueryOptions.forEach((prop) => {
      if (this[`_${prop}`]) {
        config.bigquery[prop] = this[`_${prop}`];
      }
    });

    return config;
  }
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
  skipLastNonDirectStep() {
    this._processingSteps = this._processingSteps.filter(
      (step) => step.queryName !== "sessions_with_last_non_direct"
    );
  }
  /**
   * Publishes the GA4 session table.
   */
  publish() {
    const sessions = publish(this._target.tableName, {
      schema: this._target.schema,
    })
      .config(this.getConfig())
      .query(
        (ctx) => `
        
        -- prepare events table
        with events as (
          select
            ${helpers.getSqlSessionId()},
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

  publishAssertions() {
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

      const validTypes = ["string", "int", "double", "float", "coalesce"];
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
}

module.exports = {
  declareSources: helpers.declareSources,
  Sessions,
};
