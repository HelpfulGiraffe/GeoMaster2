const https = require("https");
const fs = require("fs");
const path = require("path");

const codes = ["ad","ae","af","ag","al","ao","ar","at","au","aw","ba","bb","bd","be","bf","bg","bh","bi","bj","bn","bo","br","bs","bt","bw","by","bz","ca","cd","cf","cg","ch","ci","cl","cm","cn","co","cr","cu","cv","cw","cy","cz","de","dj","dk","dm","do","dz","ec","ee","eg","eh","er","es","et","fi","fj","fm","fr","ga","gb","gd","gh","gm","gn","gq","gr","gt","gw","gy","hk","hn","hr","ht","hu","id","ie","il","in","iq","ir","is","it","jm","jo","jp","ke","kg","kh","ki","km","kn","kp","kr","kw","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","me","mg","mh","mk","ml","mm","mn","mo","mr","mt","mu","mv","mw","mx","my","mz","na","ne","ng","ni","nl","no","np","nr","nz","om","pa","pe","pg","ph","pk","pl","pr","ps","pt","pw","py","qa","ro","rs","ru","rw","sa","sb","sc","sd","se","sg","si","sk","sl","sm","sn","so","sr","ss","st","sv","sy","sz","td","tg","th","tj","tl","tm","tn","to","tr","tt","tv","tw","tz","ua","ug","us","uy","uz","va","vc","ve","vn","vu","ws","xk","ye","za","zm","zw"];

const outDir = path.join(__dirname, "public", "flags");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let completed = 0;
let failed = [];

function download(code) {
  return new Promise((resolve) => {
    const url = `https://flagsapi.com/${code.toUpperCase()}/flat/128.png`;
    const dest = path.join(outDir, `${code}.png`);
    if (fs.existsSync(dest)) { completed++; process.stdout.write(`\rDownloaded: ${completed}/${codes.length}`); resolve(); return; }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        completed++;
        process.stdout.write(`\rDownloaded: ${completed}/${codes.length}`);
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      failed.push(code);
      completed++;
      resolve();
    });
  });
}

(async () => {
  console.log(`Downloading ${codes.length} flags...`);
  // Download in batches of 10 to avoid overwhelming the server
  for (let i = 0; i < codes.length; i += 10) {
    const batch = codes.slice(i, i + 10).map(download);
    await Promise.all(batch);
  }
  console.log(`\nDone!`);
  if (failed.length) console.log(`Failed: ${failed.join(", ")}`);
  else console.log("All flags downloaded successfully!");
})();
