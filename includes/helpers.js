const { getSqlUnionAllFromRows } = require("dataform-ga4-helpers");

function getSqlSourceMediumCaseStatement(config) {
  const conditions = config
    .map((condition) => {
      return `WHEN ${getSqlCondition(condition)} THEN struct(${
        condition.value.source
      } as source, ${condition.value.medium} as medium, ${
        condition.value.campaign
      } as campaign
      )`;
    })
    .join(" ");

  return `CASE ${conditions} ELSE struct('(direct)' as source, '(none)' as medium, '(not set)' as campaign) END`;
}

function getSqlCondition(condition) {
  let sql = "";
  let column;
  if (condition.columns.length > 1) {
    column = `coalesce(${condition.columns.join(", ")})`;
  } else {
    column = condition.columns[0];
  }

  switch (condition.conditionType) {
    case "NOT_NULL":
      sql = `${column} IS NOT NULL`;
      break;
    case "REGEXP_CONTAINS":
      sql = `REGEXP_CONTAINS(${column}, r'${condition.conditionValue}')`;
      break;
    default:
      throw new TypeError(
        "Unsupported condition type. Supported types are: NOT_NULL"
      );
      break;
  }
  return sql;
}

function getSqlSourceCategoriesTable() {
  const { rows } = require("./includes/ga4_source_categories.js");
  return getSqlUnionAllFromRows(rows);
}

function getSqlDefaultChannelGrouping(source, medium, source_category) {
  return `
    case 
    when 
        (
        ${source} is null 
            and ${medium} is null
        )
        or (
        ${source} = '(direct)'
        and (${medium} = '(none)' or ${medium} = '(not set)')
        ) 
        then 'Direct'
    when 
        (
        REGEXP_CONTAINS(${source}, r"^(facebook|instagram|pinterest|reddit|twitter|linkedin)") = true
        or ${source_category} = 'SOURCE_CATEGORY_SOCIAL' 
        )
        and REGEXP_CONTAINS(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$") = true
        then 'Paid Social'
    when 
        REGEXP_CONTAINS(${source}, r"^(facebook|instagram|pinterest|reddit|twitter|linkedin)") = true
        or ${medium} in ("social","social-network","social-media","sm","social network","social media")
        or ${source_category} = 'SOURCE_CATEGORY_SOCIAL' 
        then 'Organic Social'
    when 
        REGEXP_CONTAINS(${medium}, r"email|e-mail|e_mail|e mail") = true
        or REGEXP_CONTAINS(${source}, r"email|e-mail|e_mail|e mail") = true
        then 'Email'
    when 
        REGEXP_CONTAINS(${medium}, r"affiliate|affiliates") = true
        then 'Affiliates'
    when 
        ${source_category} = 'SOURCE_CATEGORY_SHOPPING' 
        and REGEXP_CONTAINS(${medium},r"^(.*cp.*|ppc|paid.*)$")
        then 'Paid Shopping'
    when 
        (${source_category} = 'SOURCE_CATEGORY_VIDEO' AND REGEXP_CONTAINS(${medium},r"^(.*cp.*|ppc|paid.*)$"))
        or ${source} = 'dv360_video'
        then 'Paid Video'
    when 
        REGEXP_CONTAINS(${medium}, r"^(display|cpm|banner)$")
        or ${source} = 'dv360_display'
        then 'Display'
    when 
        ${source_category} = 'SOURCE_CATEGORY_SEARCH'
        and REGEXP_CONTAINS(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
        then 'Paid Search'
    when 
        REGEXP_CONTAINS(${medium}, r"^(cpv|cpa|cpp|content-text)$")
        then 'Other Advertising'
    when 
        ${medium} = 'organic' or ${source_category} = 'SOURCE_CATEGORY_SEARCH'
        then 'Organic Search'
    when 
        ${source_category} = 'SOURCE_CATEGORY_VIDEO'
        or REGEXP_CONTAINS(${medium}, r"^(.*video.*)$")
        then 'Organic Video'
    when 
        ${source_category} = 'SOURCE_CATEGORY_SHOPPING'
        then 'Organic Shopping'
    when 
        ${medium} in ("referral", "app", "link")
        then 'Referral'
    when 
        ${medium} = 'audio'
        then 'Audio'
    when 
        ${medium} = 'sms'
        or ${source} = 'sms'
        then 'SMS'
    when 
        REGEXP_CONTAINS(${medium}, r"(mobile|notification|push$)") or ${source} = 'firebase'
        then 'Push Notifications'
    else '(Other)' 
    end 
    `;
}

module.exports = {
  getSqlSourceMediumCaseStatement,
  getSqlDefaultChannelGrouping,
  getSqlSourceCategoriesTable,
};
