const helpers = require("dataform-ga4-helpers");

const processingSteps = [
  {
    queryName: "sessions_base",
    query: (session, ctx) => `sessions_base as (
        select
          session_id,
          ${helpers.getSqlGetFirstNotNullValue("user_pseudo_id")},
          ${helpers.getSqlGetFirstNotNullValue("user_id")},
          ${helpers.getSqlGetFirstNotNullValue(
            "page_location",
            "landing_page"
          )},
          ARRAY_AGG(IF(ignore_referrer = 'true', NULL, NET.HOST(lower(page_referrer))) IGNORE NULLS ORDER BY event_timestamp limit 1)[SAFE_OFFSET(0)] as session_referrer,
          min(date) as date,
          min(event_timestamp) as session_start,
          max(event_timestamp) as session_end,
          max(session_engaged) as session_engaged,
          ${helpers.getSqlGetFirstNotNullValue("source")},
          ${helpers.getSqlGetFirstNotNullValue("medium")},
          ${helpers.getSqlGetFirstNotNullValue("campaign")},
          ${helpers.getSqlGetFirstNotNullValue("gclid")},
          ${ctx.when(
            session._columns.length > 0,
            `${helpers.getSqlGetFirstNotNullValues(session._columns)}, `
          )}
          ${ctx.when(
            session._eventParams.length > 0,
            `${helpers.getSqlGetFirstNotNullValues(session._eventParams)}, `
          )}
          ${ctx.when(
            session._userProperties.length > 0,
            `${helpers.getSqlGetFirstNotNullValues(session._userProperties)}, `
          )}
          ${ctx.when(
            session._queryParameters.length > 0,
            `${helpers.getSqlGetFirstNotNullValues(session._queryParameters)}, `
          )}
    
        from events
        where session_id is not null
        group by session_id
      )
    `,
  },
  {
    queryName: "sessions_with_source_medium_and_lp",
    query: (session, ctx) => `sessions_with_source_medium_and_lp as (
        select 
            * except (landing_page),
            ${helpers.getSqlSourceMediumCaseStatement(
              session._sourceMediumRules
            )} as last_click_attribution,
            struct (
              landing_page as href,
              lower(net.host(landing_page)) as host,
            -- https://www.rfc-editor.org/rfc/rfc3986#appendix-B
              lower(REGEXP_EXTRACT(landing_page, r'^(?:(?:[^:\\/?#]+):)?(?:\\/\\/(?:[^\\/?#]*))?([^?#]*)(?:\\?(?:[^#]*))?(?:#(?:.*))?')) as path
            ) as landing_page,
          from sessions_base 
        )`,
  },
  {
    queryName: "sessions_with_channel",
    query: (session, ctx) => `sessions_with_channel as (
        select
            sessions.* except (last_click_attribution),
            struct (
                last_click_attribution.source as source,
                last_click_attribution.medium as medium,
                last_click_attribution.campaign as campaign,
                ${helpers.getSqlDefaultChannelGrouping(
                  "last_click_attribution.source",
                  "last_click_attribution.medium",
                  "source_categories.source_category"
                )}  as channel
            ) as last_click_attribution
        from sessions_with_source_medium_and_lp as sessions
        left join source_categories on source_categories.source = sessions.source
    )`,
  },

  {
    queryName: "sessions_with_last_non_direct",
    query: (session, ctx) => `sessions_with_last_non_direct as (
        select
        *,
        if(
            last_click_attribution.channel = 'Direct',
            last_value(if(last_click_attribution.channel = 'Direct', null, last_click_attribution) ignore nulls) over(
              partition by user_pseudo_id
              order by UNIX_SECONDS(session_start)
              range between ${session.LastNonDirectLookBackWindow*60*60*24} preceding and 1 preceding 
            ),
            last_click_attribution
          ) as last_non_direct_attribution,
        from sessions_with_channel
    )`,
  },
];

module.exports = {
  processingSteps,
};
