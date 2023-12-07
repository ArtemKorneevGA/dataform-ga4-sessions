const defaultAssertions = [
  {
    name: "sessions_timeliness",
    config: {
      description: `Check that we have fresh sessions with a delay of no more than 2 days`,
    },
    query: (sessionTable) => `WITH max_date AS (
        SELECT
            DATE_DIFF(CURRENT_DATE(), MAX(date), DAY) as diff
        FROM
        ${sessionTable}
        where date >= (CURRENT_DATE() - 10)    
    )
    
    SELECT
        diff
    FROM
        max_date
    where diff > 2`,
  },
  {
    name: "sessions_completeness",
    config: {
      description: `Check we have session for all days without gaps`,
    },
    query: (sessionTable) => `WITH dates AS (
        SELECT
            date
        FROM
        UNNEST( 
            GENERATE_DATE_ARRAY(
                GREATEST((CURRENT_DATE() - 10), (SELECT min(date) FROM ${sessionTable})), 
                (SELECT max(date) FROM ${sessionTable}), 
                INTERVAL 1 day) 
        ) AS date
    ),

    sessions_tbl AS (
        SELECT
            date,
            count(session_id) AS sessions
        FROM
            ${sessionTable}
        where date >= (CURRENT_DATE() - 10)
        GROUP BY
        1
    )
    SELECT
        d.date,
        e.sessions
    FROM
        dates d
    LEFT JOIN sessions_tbl e ON e.date = d.date
    WHERE
        e.sessions is null
        or e.sessions = 0`,
  },
  {
    name: "sessions_validity",
    config: {
      description: `Check that sessions have all required columns`,
    },
    query: (sessionTable) => `SELECT 
    1 as check
        FROM ${sessionTable}
    where 
        (date >= (CURRENT_DATE() - 10))
        and 
        (
        landing_page.href is null
        or user_pseudo_id is null
        or session_id is null
        or date is null
        or session_start is null
        )`,
  },
];
module.exports = {
  defaultAssertions,
};
