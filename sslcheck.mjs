function resolveSsl(cs){
  if(/[?&]sslmode=disable/.test(cs)) return undefined;
  const isLocal=/@(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal)[:/]/.test(cs);
  if(isLocal) return undefined;
  return {rejectUnauthorized:false};
}
const cases=[
 ["postgresql://u:p@localhost:5432/db","no TLS"],
 ["postgresql://u:p@127.0.0.1:5432/db","no TLS"],
 ["postgresql://u:p@monorail.proxy.rlwy.net:41234/railway","TLS"],
 ["postgresql://u:p@containers-us-west-1.railway.app:6543/railway","TLS"],
 ["postgresql://u:p@ep-x.neon.tech/db","TLS"],
 ["postgresql://u:p@somehost:5432/db?sslmode=disable","no TLS"],
];
for(const [cs,want] of cases){
  const got = resolveSsl(cs) ? "TLS" : "no TLS";
  console.log((got===want?"PASS":"FAIL")+"  "+want.padEnd(7)+" <- "+cs.replace(/\/\/.*@/,"//***@"));
}
