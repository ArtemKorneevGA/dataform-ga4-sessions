"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[765],{3905:(e,t,s)=>{s.d(t,{Zo:()=>u,kt:()=>m});var n=s(7294);function a(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}function r(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),s.push.apply(s,n)}return s}function o(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{};t%2?r(Object(s),!0).forEach((function(t){a(e,t,s[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(s)):r(Object(s)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(s,t))}))}return e}function i(e,t){if(null==e)return{};var s,n,a=function(e,t){if(null==e)return{};var s,n,a={},r=Object.keys(e);for(n=0;n<r.length;n++)s=r[n],t.indexOf(s)>=0||(a[s]=e[s]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)s=r[n],t.indexOf(s)>=0||Object.prototype.propertyIsEnumerable.call(e,s)&&(a[s]=e[s])}return a}var l=n.createContext({}),d=function(e){var t=n.useContext(l),s=t;return e&&(s="function"==typeof e?e(t):o(o({},t),e)),s},u=function(e){var t=d(e.components);return n.createElement(l.Provider,{value:t},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var s=e.components,a=e.mdxType,r=e.originalType,l=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),c=d(s),f=a,m=c["".concat(l,".").concat(f)]||c[f]||p[f]||r;return s?n.createElement(m,o(o({ref:t},u),{},{components:s})):n.createElement(m,o({ref:t},u))}));function m(e,t){var s=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=s.length,o=new Array(r);o[0]=f;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i[c]="string"==typeof e?e:a,o[1]=i;for(var d=2;d<r;d++)o[d]=s[d];return n.createElement.apply(null,o)}return n.createElement.apply(null,s)}f.displayName="MDXCreateElement"},9046:(e,t,s)=>{s.r(t),s.d(t,{contentTitle:()=>o,default:()=>c,frontMatter:()=>r,metadata:()=>i,toc:()=>l});var n=s(7462),a=(s(7294),s(3905));const r={sidebar_position:8},o="Default session assertions",i={unversionedId:"sessions/assertions",id:"sessions/assertions",isDocsHomePage:!1,title:"Default session assertions",description:"Dataform assertions",source:"@site/docs/sessions/assertions.md",sourceDirName:"sessions",slug:"/sessions/assertions",permalink:"/dataform-ga4-sessions/sessions/assertions",editUrl:"https://github.com/facebook/docusaurus/edit/main/website/docs/sessions/assertions.md",tags:[],version:"current",sidebarPosition:8,frontMatter:{sidebar_position:8},sidebar:"tutorialSidebar",previous:{title:"Session id",permalink:"/dataform-ga4-sessions/sessions/session-id"},next:{title:"Attribution models",permalink:"/dataform-ga4-sessions/sessions/attribution"}},l=[{value:"Dataform assertions",id:"dataform-assertions",children:[]},{value:"Session assertions",id:"session-assertions",children:[]}],d={toc:l},u="wrapper";function c(e){let{components:t,...s}=e;return(0,a.kt)(u,(0,n.Z)({},d,s,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"default-session-assertions"},"Default session assertions"),(0,a.kt)("h2",{id:"dataform-assertions"},"Dataform assertions"),(0,a.kt)("p",null,"Assertions helps you to checks data quality. It's actually a SQL query that should return 0 rows if everything is ok. If the query returns more than 0 rows - the assertion is failed."),(0,a.kt)("p",null,"You could read more about Dataform assertions ",(0,a.kt)("a",{parentName:"p",href:"https://cloud.google.com/dataform/docs/assertions"},"here"),"."),(0,a.kt)("p",null,"If you add assertions as dependencies it prevents the action from running if the assertion is failed. In the package assertions are not added as dependencies, so they don't block actions."),(0,a.kt)("p",null,"For all assertions and actions the package adds the same tag (equal to source dataset name). And if you run Dataform workflow with this tag, or run all actions - assertions would be executed after ",(0,a.kt)("inlineCode",{parentName:"p"},"sessions"),". And if assertion is failed, the whole workflow would be marked as failed but ",(0,a.kt)("inlineCode",{parentName:"p"},"sessions")," table would be updated anyway. So it's recommended to subscribe to worflow fails and check manually what the reason was."),(0,a.kt)("p",null,"Read official documentation - ",(0,a.kt)("a",{parentName:"p",href:"https://cloud.google.com/dataform/docs/log-based-alerts"},"configure alerts for failed workflow invocations"),"."),(0,a.kt)("h2",{id:"session-assertions"},"Session assertions"),(0,a.kt)("p",null,"You could add default session assertions using ",(0,a.kt)("inlineCode",{parentName:"p"},"publishAssertions")," method."),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"Name"),(0,a.kt)("th",{parentName:"tr",align:null},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"Sessions Timeliness"),(0,a.kt)("td",{parentName:"tr",align:null},"Check that we have fresh sessions with a delay of no more than 2 days")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"Sessions Completeness"),(0,a.kt)("td",{parentName:"tr",align:null},"Check that we have sessions for all days without gaps")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"Sessions Validity"),(0,a.kt)("td",{parentName:"tr",align:null},"Check that sessions have all the required columns")))),(0,a.kt)("p",null,"`"))}c.isMDXComponent=!0}}]);