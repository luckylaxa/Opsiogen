const {chromium}=require('playwright');
const jobs=[['dsys',1600,1200,1]];
(async()=>{const b=await chromium.launch();
for(const [n,w,h,s] of jobs){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:s});await p.goto('file://'+__dirname+'/'+n+'.html');await p.waitForTimeout(500);await p.screenshot({path:__dirname+'/../art/'+n+'.png'});await p.close();}
await b.close();})();
