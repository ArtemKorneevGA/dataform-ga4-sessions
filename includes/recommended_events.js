const recommendedEvents = [
  {
    eventName: "add_payment_info",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "coupon", type: "string" },
      { name: "currency", type: "string" },
      { name: "payment_type", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "add_shipping_info",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "coupon", type: "string" },
      { name: "currency", type: "string" },
      { name: "shipping_tier", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "add_to_cart",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "currency", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "add_to_wishlist",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "currency", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "begin_checkout",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "coupon", type: "string" },
      { name: "currency", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "earn_virtual_currency",
    eventParams: [
      { name: "virtual_currency_name", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "generate_lead",
    eventParams: [
      { name: "value", type: "coalesce_float" },
      { name: "currency", type: "string" },
    ],
  },
  {
    eventName: "join_group",
    eventParams: [{ name: "group_id", type: "string" }],
  },
  {
    eventName: "level_end",
    eventParams: [
      { name: "level_name", type: "string" },
      { name: "success", type: "string" },
    ],
  },
  {
    eventName: "level_start",
    eventParams: [{ name: "level_name", type: "string" }],
  },
  {
    eventName: "level_up",
    eventParams: [
      { name: "character", type: "string" },
      { name: "level", type: "int" },
    ],
  },
  {
    eventName: "login",
    eventParams: [{ name: "method", type: "string" }],
  },
  {
    eventName: "post_score",
    eventParams: [
      { name: "level", type: "string" },
      { name: "character", type: "string" },
      { name: "score", type: "int" },
    ],
  },
  {
    eventName: "purchase",
    columns: [
      { name: "items" },
      {
        name: "ecommerce.purchase_revenue_in_usd",
        columnName: "purchase_revenue_in_usd",
      },
      {
        name: "ecommerce.shipping_value_in_usd",
        columnName: "shipping_value_in_usd",
      },
      { name: "ecommerce.tax_value_in_usd", columnName: "tax_value_in_usd" },
    ],
    eventParams: [
      { name: "coupon", type: "string" },
      { name: "currency", type: "string" },
      { name: "transaction_id", type: "string" },
      { name: "shipping", type: "coalesce_float" },
      { name: "tax", type: "coalesce_float" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "refund",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "coupon", type: "string" },
      { name: "currency", type: "string" },
      { name: "transaction_id", type: "string" },
      { name: "shipping", type: "coalesce_float" },
      { name: "tax", type: "coalesce_float" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "remove_from_cart",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "currency", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "search",
    eventParams: [{ name: "search_term", type: "string" }],
  },
  {
    eventName: "select_content",
    eventParams: [
      { name: "content_type", type: "string" },
      { name: "item_id", type: "string" },
    ],
  },
  {
    eventName: "select_item",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "item_list_name", type: "string" },
      { name: "item_list_id", type: "string" },
    ],
  },
  {
    eventName: "select_promotion",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "promotion_id", type: "string" },
      { name: "promotion_name", type: "string" },
      { name: "creative_name", type: "string" },
      { name: "creative_slot", type: "string" },
    ],
  },
  {
    eventName: "share",
    eventParams: [
      { name: "content_type", type: "string" },
      { name: "item_id", type: "string" },
      { name: "method", type: "string" },
    ],
  },
  {
    eventName: "sign_up",
    eventParams: [{ name: "method", type: "string" }],
  },
  {
    eventName: "spend_virtual_currency",
    eventParams: [
      { name: "item_name", type: "string" },
      { name: "virtual_currency_name", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "tutorial_begin",
  },
  {
    eventName: "tutorial_complete",
  },
  {
    eventName: "unlock_achievement",
    eventParams: [{ name: "achievement_id", type: "string" }],
  },
  {
    eventName: "view_cart",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "currency", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "view_item",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "currency", type: "string" },
      { name: "value", type: "coalesce_float" },
    ],
  },
  {
    eventName: "view_item_list",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "item_list_name", type: "string" },
      { name: "item_list_id", type: "string" },
    ],
  },
  {
    eventName: "view_promotion",
    columns: [{ name: "items" }],
    eventParams: [
      { name: "promotion_id", type: "string" },
      { name: "promotion_name", type: "string" },
      { name: "creative_name", type: "string" },
      { name: "creative_slot", type: "string" },
    ],
  },
  {
    eventName: "click",
    eventParams: [
      { name: "link_classes", type: "string" },
      { name: "link_domain", type: "string" },
      { name: "link_id", type: "string" },
      { name: "link_url", type: "string" },
      { name: "outbound", type: "string" },
    ],
  },
  {
    eventName: "file_download",
    eventParams: [
      { name: "file_extension", type: "string" },
      { name: "file_name", type: "string" },
      { name: "link_classes", type: "string" },
      { name: "link_domain", type: "string" },
      { name: "link_id", type: "string" },
      { name: "link_text", type: "string" },
      { name: "link_url", type: "string" },
    ],
  },
  {
    eventName: "form_start",
    eventParams: [
      { name: "form_id", type: "string" },
      { name: "form_name", type: "string" },
      { name: "form_destination", type: "string" },
    ],
  },
  {
    eventName: "form_submit",
    eventParams: [
      { name: "form_id", type: "string" },
      { name: "form_name", type: "string" },
      { name: "form_destination", type: "string" },
      { name: "form_submit_text", type: "string" },
    ],
  },
  {
    eventName: "scroll",
    eventParams: [{ name: "engagement_time_msec", type: "int" }],
  },
  {
    eventName: "video_complete",
    eventParams: [
      { name: "video_current_time", type: "int" },
      { name: "video_duration", type: "int" },
      { name: "video_percent", type: "int" },
      { name: "video_provider", type: "string" },
      { name: "video_title", type: "string" },
      { name: "video_url", type: "string" },
      { name: "visible", type: "string" },
    ],
  },
  {
    eventName: "video_progress",
    eventParams: [
      { name: "video_current_time", type: "int" },
      { name: "video_duration", type: "int" },
      { name: "video_percent", type: "int" },
      { name: "video_provider", type: "string" },
      { name: "video_title", type: "string" },
      { name: "video_url", type: "string" },
      { name: "visible", type: "string" },
    ],
  },
  {
    eventName: "video_start",
    eventParams: [
      { name: "video_current_time", type: "int" },
      { name: "video_duration", type: "int" },
      { name: "video_percent", type: "int" },
      { name: "video_provider", type: "string" },
      { name: "video_title", type: "string" },
      { name: "video_url", type: "string" },
      { name: "visible", type: "string" },
    ],
  },
  {
    eventName: "view_search_results",
    eventParams: [{ name: "search_term", type: "string" }],
  },
  {
    eventName: "page_view",
    eventParams: [
      { name: "page_title", type: "string" },
      { name: "page_referrer", type: "string" },
    ],
  },
];
module.exports = {
  recommendedEvents,
};
