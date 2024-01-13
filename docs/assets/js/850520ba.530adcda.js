"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[124],{3905:(e,t,a)=>{a.d(t,{Zo:()=>u,kt:()=>f});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=n.createContext({}),c=function(e){var t=n.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},u=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},d="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),d=c(a),m=r,f=d["".concat(l,".").concat(m)]||d[m]||p[m]||o;return a?n.createElement(f,i(i({ref:t},u),{},{components:a})):n.createElement(f,i({ref:t},u))}));function f(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,i=new Array(o);i[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[d]="string"==typeof e?e:r,i[1]=s;for(var c=2;c<o;c++)i[c]=a[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}m.displayName="MDXCreateElement"},8227:(e,t,a)=>{a.r(t),a.d(t,{contentTitle:()=>i,default:()=>d,frontMatter:()=>o,metadata:()=>s,toc:()=>l});var n=a(7462),r=(a(7294),a(3905));const o={sidebar_position:5},i="Scheduling - Advanced",s={unversionedId:"guides/scheduling-advanced",id:"guides/scheduling-advanced",isDocsHomePage:!1,title:"Scheduling - Advanced",description:"How to run Dataform actions after GA4 export to BigQuery",source:"@site/docs/guides/scheduling-advanced.md",sourceDirName:"guides",slug:"/guides/scheduling-advanced",permalink:"/dataform-ga4-sessions/guides/scheduling-advanced",editUrl:"https://github.com/facebook/docusaurus/edit/main/website/docs/guides/scheduling-advanced.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"Scheduling - Daily updates",permalink:"/dataform-ga4-sessions/guides/scheduling-daily"},next:{title:"Troubleshooting",permalink:"/dataform-ga4-sessions/guides/troubleshooting"}},l=[{value:"How to run Dataform actions after GA4 export to BigQuery",id:"how-to-run-dataform-actions-after-ga4-export-to-bigquery",children:[]},{value:"More details",id:"more-details",children:[]},{value:"Terrafrom",id:"terrafrom",children:[]}],c={toc:l},u="wrapper";function d(e){let{components:t,...a}=e;return(0,r.kt)(u,(0,n.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"scheduling---advanced"},"Scheduling - Advanced"),(0,r.kt)("h2",{id:"how-to-run-dataform-actions-after-ga4-export-to-bigquery"},"How to run Dataform actions after GA4 export to BigQuery"),(0,r.kt)("p",null,"You could run Dataform actions as soon as GA4 exports data to BigQuery. The main idea is:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"subscribe to an event when GA4 exports data to BigQuery (using Cloud Logging Router)"),(0,r.kt)("li",{parentName:"ul"},"on this event build realese configuration and pass the new table name as a variable"),(0,r.kt)("li",{parentName:"ul"},"execute release configuration")),(0,r.kt)("p",null,"In this case you should define configuration variables in your ",(0,r.kt)("inlineCode",{parentName:"p"},"dataform.json")," file like this:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-javascript"},'{\n  "defaultSchema": "dataform",\n  "assertionSchema": "dataform_assertions",\n  "warehouse": "bigquery",\n  "defaultDatabase": "<GCP-PROJECT-ID>",\n  "defaultLocation": "<REGION>",\n  "vars": {\n    "GA4_DATASET": "analytics_XXXXX"\n    "GA4_TABLE": "events_<date>",\n  }\n}\n')),(0,r.kt)("p",null,"and use them in your ",(0,r.kt)("inlineCode",{parentName:"p"},"definitions/sources/ga4.js")," file like this:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-javascript"},'const ga4 = require("dataform-ga4-sessions");\n\nconst config = {\n  dataset: dataform.projectConfig.vars.GA4_DATASET,\n  incrementalTableName: dataform.projectConfig.vars.GA4_TABLE,\n};\n\nga4.declareSources(config);\n')),(0,r.kt)("p",null,"And during relase configuration creation you could rewrite variables in ",(0,r.kt)("inlineCode",{parentName:"p"},"dataform.json")," like this (Python example):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-python"},'compilation_result["code_compilation_config"] = {\n"vars": {\n        f"GA4_TABLE": config.last_event_table,\n    }\n}\n')),(0,r.kt)("p",null,"Here we set value to ",(0,r.kt)("inlineCode",{parentName:"p"},"dataform.projectConfig.vars.GA4_TABLE"),"."),(0,r.kt)("p",null,"This way, you will always query the latest day table. Reduce costs and simplify your workflows."),(0,r.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},"Sometimes GA4 updates daily data a few times, even a few days later. So be ready to handle such cases. Especially if you decide to create a custom column like ",(0,r.kt)("inlineCode",{parentName:"p"},"sessions_count")," per user."))),(0,r.kt)("h2",{id:"more-details"},"More details"),(0,r.kt)("p",null,"You could read more about how to set up this scheduling:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://gtm-gear.com/posts/dataform-cloud-functions/"},"Dataform: schedule daily updates using Cloud Functions")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://tanelytics.com/trigger-dataform-after-ga4-bigquery-export/"},"Cloud Workflow \u2013 Run Dataform queries immediately after the GA4 BigQuery export happens")," by ",(0,r.kt)("a",{parentName:"li",href:"https://tanelytics.com/"},"Taneli Salonen"))),(0,r.kt)("h2",{id:"terrafrom"},"Terrafrom"),(0,r.kt)("p",null,"You could automate the process of enabling all needed GCP services using Terraform. A great starting point is GitHub repository - ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/Liscor/terraform_dataform_ga4_pipeline"},"Dataform Pipeline for Google Analytics 4")," created by ",(0,r.kt)("a",{parentName:"p",href:"https://moritzbauer.info/"},"Moritz Bauer"),"."))}d.isMDXComponent=!0}}]);