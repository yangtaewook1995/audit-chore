const fetch = require("node-fetch");
require("../src/test.js");

const githubExample = "https://github.com/HAECHI-LABS/audit-athlon";
const etherscanExample = "https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7";

console.log("Test");

getUrlInfo(githubExample).then(console.log);
getUrlDetail(githubExample).then(console.log);

getUrlInfo(etherscanExample).then(console.log);
getUrlDetail(etherscanExample).then(console.log);
