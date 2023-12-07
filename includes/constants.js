// const GA4_DATABASE = 'bigquery-public-data';
const GA4_DATABASE = "cafe-assistant-295900";

const defaultSessionNames = [
  "session_id",
  "user_id",
  "date",
  "event_timestamp",
  "user_pseudo_id",
  "session_engaged",
  "page_location",
  "page_referrer",
  "ignore_referrer",
  "source",
  "medium",
  "campaign",
  "gclid",
  "landing_page",
  "session_referrer",
  "session_start",
  "session_end",
];

const sessionPresets = {
  none: {
    columns: [],
    eventParams: [],
    userProperties: [],
  },
  standard: {
    columns: [
      {
        name: "geo.country",
        columnName: "country",
      },
      {
        name: "device.category",
        columnName: "device_category",
      },
      {
        name: "device.language",
        columnName: "language",
      },
    ],
    eventParams: [
      {
        name: "term",
      },
      {
        name: "content",
      },
    ],
    userProperties: [],
  },
  extended: {
    columns: [
      { name: "privacy_info" },
      {
        name: "device.category",
        columnName: "device_category",
      },
      { name: "device.mobile_model_name", columnName: "mobile_model_name" },
      {
        name: "device.mobile_marketing_name",
        columnName: "mobile_marketing_name",
      },
      {
        name: "device.mobile_os_hardware_model",
        columnName: "mobile_os_hardware_model",
      },
      { name: "device.operating_system", columnName: "operating_system" },
      {
        name: "device.operating_system_version",
        columnName: "operating_system_version",
      },
      { name: "device.vendor_id", columnName: "vendor_id" },
      { name: "device.advertising_id", columnName: "advertising_id" },
      { name: "device.language", columnName: "language" },
      {
        name: "device.is_limited_ad_tracking",
        columnName: "is_limited_ad_tracking",
      },
      {
        name: "device.time_zone_offset_seconds",
        columnName: "time_zone_offset_seconds",
      },
      { name: "device.web_info.browser", columnName: "browser" },
      {
        name: "device.web_info.browser_version",
        columnName: "browser_version",
      },
      { name: "device.web_info.hostname", columnName: "hostname" },
      { name: "geo.continent", columnName: "continent" },
      { name: "geo.country", columnName: "country" },
      { name: "geo.region", columnName: "region" },
      { name: "geo.city", columnName: "city" },
      { name: "geo.sub_continent", columnName: "sub_continent" },
      { name: "geo.metro", columnName: "metro" },
      { name: "stream_id" },
      { name: "platform" },
    ],
    eventParams: [
      {
        name: "term",
      },
      {
        name: "content",
      },
    ],
    userProperties: [],
  },
};

const defaultPostProcessing = {
  delete: ["source", "medium", "campaign"],
};

const defaultSourceMediumRules = [
  {
    columns: ["gclid"],
    conditionType: "NOT_NULL",
    conditionValue: "",
    value: {
      source: "'google'",
      medium: "'cpc'",
      campaign: "campaign",
    },
  },
  {
    columns: ["source", "medium", "campaign"],
    conditionType: "NOT_NULL",
    conditionValue: "",
    value: {
      source: "source",
      medium: "medium",
      campaign: "campaign",
    },
  },
  {
    columns: ["session_referrer"],
    conditionType: "NOT_NULL",
    conditionValue: "",
    value: {
      source: "session_referrer",
      medium: "'referral'",
      campaign: "'not set'",
    },
  },
];

module.exports = {
  defaultSessionNames,
  sessionPresets,
  defaultSourceMediumRules,
  defaultPostProcessing,
  GA4_DATABASE,
};
