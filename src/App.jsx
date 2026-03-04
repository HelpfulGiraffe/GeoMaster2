import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Google Fonts ─── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap";
document.head.appendChild(fontLink);

/* ─── D3 + TopoJSON via CDN ─── */
let d3Loaded = false;
function loadD3() {
  return new Promise((resolve) => {
    if (window.d3 && d3Loaded) return resolve();
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js";
      s2.onload = () => { d3Loaded = true; resolve(); };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });
}

/* ─── DATA ─── */
const countries = [
  {name:"Albania",code:"al",region:"Europe",similar:["mc","ch","at"]},
  {name:"Andorra",code:"ad",region:"Europe",similar:["fr","es","be"]},
  {name:"Austria",code:"at",region:"Europe",similar:["de","ch","li"]},
  {name:"Belarus",code:"by",region:"Europe",similar:["ru","ua","ro"]},
  {name:"Belgium",code:"be",region:"Europe",similar:["de","nl","fr"]},
  {name:"Bosnia & Herzegovina",code:"ba",region:"Europe",similar:["rs","hr","si"]},
  {name:"Bulgaria",code:"bg",region:"Europe",similar:["ru","ro","sk"]},
  {name:"Croatia",code:"hr",region:"Europe",similar:["rs","si","ba"]},
  {name:"Cyprus",code:"cy",region:"Europe",similar:["gr","mt","al"]},
  {name:"Czech Republic",code:"cz",region:"Europe",similar:["sk","pl","si"]},
  {name:"Denmark",code:"dk",region:"Europe",similar:["se","no","fi"]},
  {name:"Estonia",code:"ee",region:"Europe",similar:["lv","lt","fi"]},
  {name:"Finland",code:"fi",region:"Europe",similar:["se","dk","no"]},
  {name:"France",code:"fr",region:"Europe",similar:["nl","ie","ml"]},
  {name:"Germany",code:"de",region:"Europe",similar:["be","at","cz"]},
  {name:"Greece",code:"gr",region:"Europe",similar:["sy","sv","so"]},
  {name:"Hungary",code:"hu",region:"Europe",similar:["it","fr","pl"]},
  {name:"Iceland",code:"is",region:"Europe",similar:["no","dk","fi"]},
  {name:"Ireland",code:"ie",region:"Europe",similar:["ci","fr","nl"]},
  {name:"Italy",code:"it",region:"Europe",similar:["mx","hu","fr"]},
  {name:"Latvia",code:"lv",region:"Europe",similar:["at","ee","lt"]},
  {name:"Liechtenstein",code:"li",region:"Europe",similar:["ch","at","de"]},
  {name:"Lithuania",code:"lt",region:"Europe",similar:["lv","ee","ru"]},
  {name:"Luxembourg",code:"lu",region:"Europe",similar:["nl","fr","de"]},
  {name:"Malta",code:"mt",region:"Europe",similar:["cy","pl","sk"]},
  {name:"Moldova",code:"md",region:"Europe",similar:["ro","bg","ru"]},
  {name:"Monaco",code:"mc",region:"Europe",similar:["al","id","pl"]},
  {name:"Montenegro",code:"me",region:"Europe",similar:["rs","ba","al"]},
  {name:"Netherlands",code:"nl",region:"Europe",similar:["fr","lu","de"]},
  {name:"North Macedonia",code:"mk",region:"Europe",similar:["rs","al","bg"]},
  {name:"Norway",code:"no",region:"Europe",similar:["dk","se","fi"]},
  {name:"Poland",code:"pl",region:"Europe",similar:["cz","sk","si"]},
  {name:"Portugal",code:"pt",region:"Europe",similar:["es","mx","it"]},
  {name:"Romania",code:"ro",region:"Europe",similar:["td","md","ad"]},
  {name:"Russia",code:"ru",region:"Europe",similar:["sk","si","nl"]},
  {name:"San Marino",code:"sm",region:"Europe",similar:["it","va","mc"]},
  {name:"Serbia",code:"rs",region:"Europe",similar:["hr","ba","me"]},
  {name:"Slovakia",code:"sk",region:"Europe",similar:["ru","cz","si"]},
  {name:"Slovenia",code:"si",region:"Europe",similar:["hr","ba","rs"]},
  {name:"Spain",code:"es",region:"Europe",similar:["pt","mx","cu"]},
  {name:"Sweden",code:"se",region:"Europe",similar:["no","dk","fi"]},
  {name:"Switzerland",code:"ch",region:"Europe",similar:["at","de","li"]},
  {name:"Ukraine",code:"ua",region:"Europe",similar:["by","sk","se"]},
  {name:"United Kingdom",code:"gb",region:"Europe",similar:["au","nz","fj"]},
  {name:"Vatican City",code:"va",region:"Europe",similar:["it","sm","mc"]},
  // Asia
  {name:"Afghanistan",code:"af",region:"Asia",similar:["ir","pk","tj"]},
  {name:"Bangladesh",code:"bd",region:"Asia",similar:["pk","in","lk"]},
  {name:"Bhutan",code:"bt",region:"Asia",similar:["np","in","lk"]},
  {name:"Brunei",code:"bn",region:"Asia",similar:["my","id","sg"]},
  {name:"Cambodia",code:"kh",region:"Asia",similar:["la","th","mm"]},
  {name:"China",code:"cn",region:"Asia",similar:["vn","kp","mn"]},
  {name:"India",code:"in",region:"Asia",similar:["nl","ro","td"]},
  {name:"Indonesia",code:"id",region:"Asia",similar:["mc","pl","sg"]},
  {name:"Japan",code:"jp",region:"Asia",similar:["bd","pw","dk"]},
  {name:"Kazakhstan",code:"kz",region:"Asia",similar:["uz","tm","kg"]},
  {name:"Kyrgyzstan",code:"kg",region:"Asia",similar:["tj","tm","uz"]},
  {name:"Laos",code:"la",region:"Asia",similar:["th","kh","mm"]},
  {name:"Malaysia",code:"my",region:"Asia",similar:["ph","id","bn"]},
  {name:"Maldives",code:"mv",region:"Asia",similar:["bd","pk","sa"]},
  {name:"Mongolia",code:"mn",region:"Asia",similar:["cn","kz","ru"]},
  {name:"Myanmar",code:"mm",region:"Asia",similar:["la","kh","th"]},
  {name:"Nepal",code:"np",region:"Asia",similar:["bt","in","lk"]},
  {name:"North Korea",code:"kp",region:"Asia",similar:["kr","cn","mn"]},
  {name:"Pakistan",code:"pk",region:"Asia",similar:["sa","ir","mv"]},
  {name:"Philippines",code:"ph",region:"Asia",similar:["my","cu","pr"]},
  {name:"Singapore",code:"sg",region:"Asia",similar:["my","id","mc"]},
  {name:"South Korea",code:"kr",region:"Asia",similar:["kp","vn","tw"]},
  {name:"Sri Lanka",code:"lk",region:"Asia",similar:["np","bt","in"]},
  {name:"Taiwan",code:"tw",region:"Asia",similar:["kr","my","sg"]},
  {name:"Tajikistan",code:"tj",region:"Asia",similar:["kg","tm","uz"]},
  {name:"Thailand",code:"th",region:"Asia",similar:["kh","la","ru"]},
  {name:"Timor-Leste",code:"tl",region:"Asia",similar:["id","sb","pg"]},
  {name:"Turkmenistan",code:"tm",region:"Asia",similar:["uz","kz","kg"]},
  {name:"Uzbekistan",code:"uz",region:"Asia",similar:["tm","kz","kg"]},
  {name:"Vietnam",code:"vn",region:"Asia",similar:["cn","kh","th"]},
  {name:"Hong Kong",code:"hk",region:"Asia",similar:["cn","sg","mo"]},
  {name:"Macau",code:"mo",region:"Asia",similar:["cn","hk","sg"]},
  // Middle East
  {name:"Bahrain",code:"bh",region:"Middle East",similar:["qa","kw","ae"]},
  {name:"Iran",code:"ir",region:"Middle East",similar:["iq","af","pk"]},
  {name:"Iraq",code:"iq",region:"Middle East",similar:["sy","eg","ye"]},
  {name:"Israel",code:"il",region:"Middle East",similar:["uy","ar","gr"]},
  {name:"Jordan",code:"jo",region:"Middle East",similar:["ps","iq","ye"]},
  {name:"Kuwait",code:"kw",region:"Middle East",similar:["jo","ps","iq"]},
  {name:"Lebanon",code:"lb",region:"Middle East",similar:["jo","ye","sy"]},
  {name:"Oman",code:"om",region:"Middle East",similar:["bh","ye","jo"]},
  {name:"Palestine",code:"ps",region:"Middle East",similar:["jo","iq","ye"]},
  {name:"Qatar",code:"qa",region:"Middle East",similar:["bh","kw","om"]},
  {name:"Saudi Arabia",code:"sa",region:"Middle East",similar:["ir","pk","mv"]},
  {name:"Syria",code:"sy",region:"Middle East",similar:["iq","ye","eg"]},
  {name:"Turkey",code:"tr",region:"Middle East",similar:["pk","az","mv"]},
  {name:"United Arab Emirates",code:"ae",region:"Middle East",similar:["kw","bh","jo"]},
  {name:"Yemen",code:"ye",region:"Middle East",similar:["iq","sy","jo"]},
  // Africa
  {name:"Algeria",code:"dz",region:"Africa",similar:["ma","tn","ly"]},
  {name:"Angola",code:"ao",region:"Africa",similar:["mz","bi","zw"]},
  {name:"Benin",code:"bj",region:"Africa",similar:["ne","ml","sn"]},
  {name:"Botswana",code:"bw",region:"Africa",similar:["sl","gm","km"]},
  {name:"Burkina Faso",code:"bf",region:"Africa",similar:["gn","ne","ml"]},
  {name:"Burundi",code:"bi",region:"Africa",similar:["rw","ug","ke"]},
  {name:"Cameroon",code:"cm",region:"Africa",similar:["sn","ng","gn"]},
  {name:"Cape Verde",code:"cv",region:"Africa",similar:["st","km","mu"]},
  {name:"Central African Republic",code:"cf",region:"Africa",similar:["cm","sn","ml"]},
  {name:"Chad",code:"td",region:"Africa",similar:["ro","md","ad"]},
  {name:"Comoros",code:"km",region:"Africa",similar:["mv","sa","dz"]},
  {name:"Congo",code:"cg",region:"Africa",similar:["cd","cf","ga"]},
  {name:"DR Congo",code:"cd",region:"Africa",similar:["ro","be","ad"]},
  {name:"Djibouti",code:"dj",region:"Africa",similar:["so","er","et"]},
  {name:"Egypt",code:"eg",region:"Africa",similar:["sy","iq","ye"]},
  {name:"Equatorial Guinea",code:"gq",region:"Africa",similar:["cm","ga","cg"]},
  {name:"Eritrea",code:"er",region:"Africa",similar:["dj","so","et"]},
  {name:"Eswatini",code:"sz",region:"Africa",similar:["ls","bw","za"]},
  {name:"Ethiopia",code:"et",region:"Africa",similar:["er","gh","ml"]},
  {name:"Gabon",code:"ga",region:"Africa",similar:["cg","cd","cf"]},
  {name:"Gambia",code:"gm",region:"Africa",similar:["sn","gw","sl"]},
  {name:"Ghana",code:"gh",region:"Africa",similar:["bf","sn","ml"]},
  {name:"Guinea",code:"gn",region:"Africa",similar:["ml","sn","bf"]},
  {name:"Guinea-Bissau",code:"gw",region:"Africa",similar:["gn","sn","gm"]},
  {name:"Ivory Coast",code:"ci",region:"Africa",similar:["fr","ie","ml"]},
  {name:"Kenya",code:"ke",region:"Africa",similar:["et","ug","tz"]},
  {name:"Lesotho",code:"ls",region:"Africa",similar:["sz","bw","za"]},
  {name:"Liberia",code:"lr",region:"Africa",similar:["sl","gh","ng"]},
  {name:"Libya",code:"ly",region:"Africa",similar:["ma","dz","tn"]},
  {name:"Madagascar",code:"mg",region:"Africa",similar:["pl","id","sg"]},
  {name:"Malawi",code:"mw",region:"Africa",similar:["zm","zw","mz"]},
  {name:"Mali",code:"ml",region:"Africa",similar:["sn","gn","bj"]},
  {name:"Mauritania",code:"mr",region:"Africa",similar:["dz","ma","sn"]},
  {name:"Mauritius",code:"mu",region:"Africa",similar:["km","cv","st"]},
  {name:"Morocco",code:"ma",region:"Africa",similar:["dz","tn","ly"]},
  {name:"Mozambique",code:"mz",region:"Africa",similar:["tz","zm","zw"]},
  {name:"Namibia",code:"na",region:"Africa",similar:["bw","za","ls"]},
  {name:"Niger",code:"ne",region:"Africa",similar:["ml","bf","sn"]},
  {name:"Nigeria",code:"ng",region:"Africa",similar:["bf","ml","sn"]},
  {name:"Rwanda",code:"rw",region:"Africa",similar:["bi","ug","ke"]},
  {name:"São Tomé & Príncipe",code:"st",region:"Africa",similar:["km","mu","cv"]},
  {name:"Senegal",code:"sn",region:"Africa",similar:["ml","gn","bj"]},
  {name:"Seychelles",code:"sc",region:"Africa",similar:["mu","km","cv"]},
  {name:"Sierra Leone",code:"sl",region:"Africa",similar:["lr","gn","gm"]},
  {name:"Somalia",code:"so",region:"Africa",similar:["dj","er","et"]},
  {name:"South Africa",code:"za",region:"Africa",similar:["bw","na","ls"]},
  {name:"South Sudan",code:"ss",region:"Africa",similar:["sd","et","er"]},
  {name:"Sudan",code:"sd",region:"Africa",similar:["ss","et","er"]},
  {name:"Tanzania",code:"tz",region:"Africa",similar:["ke","ug","mz"]},
  {name:"Togo",code:"tg",region:"Africa",similar:["bj","gh","ml"]},
  {name:"Tunisia",code:"tn",region:"Africa",similar:["ma","dz","ly"]},
  {name:"Uganda",code:"ug",region:"Africa",similar:["ke","rw","bi"]},
  {name:"Zambia",code:"zm",region:"Africa",similar:["mw","zw","na"]},
  {name:"Zimbabwe",code:"zw",region:"Africa",similar:["zm","mw","bw"]},
  {name:"Western Sahara",code:"eh",region:"Africa",similar:["ma","mr","dz"]},
  // Americas
  {name:"Antigua & Barbuda",code:"ag",region:"Americas",similar:["bb","lc","gd"]},
  {name:"Argentina",code:"ar",region:"Americas",similar:["uy","sv","ni"]},
  {name:"Bahamas",code:"bs",region:"Americas",similar:["bb","jm","tt"]},
  {name:"Barbados",code:"bb",region:"Americas",similar:["ag","lc","gd"]},
  {name:"Belize",code:"bz",region:"Americas",similar:["gt","hn","sv"]},
  {name:"Bolivia",code:"bo",region:"Americas",similar:["gh","sn","cm"]},
  {name:"Brazil",code:"br",region:"Americas",similar:["au","ve","co"]},
  {name:"Canada",code:"ca",region:"Americas",similar:["dk","pe","no"]},
  {name:"Chile",code:"cl",region:"Americas",similar:["cu","do","pr"]},
  {name:"Colombia",code:"co",region:"Americas",similar:["ec","ve","bo"]},
  {name:"Costa Rica",code:"cr",region:"Americas",similar:["gt","hn","ni"]},
  {name:"Cuba",code:"cu",region:"Americas",similar:["pr","do","pa"]},
  {name:"Dominica",code:"dm",region:"Americas",similar:["ag","bb","lc"]},
  {name:"Dominican Republic",code:"do",region:"Americas",similar:["cu","ht","pr"]},
  {name:"Ecuador",code:"ec",region:"Americas",similar:["co","ve","pe"]},
  {name:"El Salvador",code:"sv",region:"Americas",similar:["gt","hn","ni"]},
  {name:"Grenada",code:"gd",region:"Americas",similar:["ag","bb","lc"]},
  {name:"Guatemala",code:"gt",region:"Americas",similar:["hn","sv","bz"]},
  {name:"Guyana",code:"gy",region:"Americas",similar:["sr","tt","bb"]},
  {name:"Haiti",code:"ht",region:"Americas",similar:["do","cu","jm"]},
  {name:"Honduras",code:"hn",region:"Americas",similar:["gt","sv","ni"]},
  {name:"Jamaica",code:"jm",region:"Americas",similar:["bb","tt","bs"]},
  {name:"Mexico",code:"mx",region:"Americas",similar:["it","ie","bf"]},
  {name:"Nicaragua",code:"ni",region:"Americas",similar:["gt","sv","hn"]},
  {name:"Panama",code:"pa",region:"Americas",similar:["cu","cr","gt"]},
  {name:"Paraguay",code:"py",region:"Americas",similar:["bo","ar","uy"]},
  {name:"Peru",code:"pe",region:"Americas",similar:["ca","dk","ch"]},
  {name:"Saint Kitts & Nevis",code:"kn",region:"Americas",similar:["ag","bb","lc"]},
  {name:"Saint Lucia",code:"lc",region:"Americas",similar:["ag","bb","gd"]},
  {name:"Saint Vincent",code:"vc",region:"Americas",similar:["ag","lc","gd"]},
  {name:"Suriname",code:"sr",region:"Americas",similar:["gy","tt","bb"]},
  {name:"Trinidad & Tobago",code:"tt",region:"Americas",similar:["bb","jm","bs"]},
  {name:"United States",code:"us",region:"Americas",similar:["my","cu","pr"]},
  {name:"Uruguay",code:"uy",region:"Americas",similar:["ar","es","gr"]},
  {name:"Venezuela",code:"ve",region:"Americas",similar:["co","ec","bo"]},
  {name:"Puerto Rico",code:"pr",region:"Americas",similar:["cu","do","us"]},
  {name:"Aruba",code:"aw",region:"Americas",similar:["nl","cw","sx"]},
  {name:"Curaçao",code:"cw",region:"Americas",similar:["aw","nl","sx"]},
  // Oceania
  {name:"Australia",code:"au",region:"Oceania",similar:["gb","nz","fj"]},
  {name:"Fiji",code:"fj",region:"Oceania",similar:["au","gb","nz"]},
  {name:"Kiribati",code:"ki",region:"Oceania",similar:["fj","sb","ws"]},
  {name:"Marshall Islands",code:"mh",region:"Oceania",similar:["pw","fm","nr"]},
  {name:"Micronesia",code:"fm",region:"Oceania",similar:["pw","mh","nr"]},
  {name:"Nauru",code:"nr",region:"Oceania",similar:["pw","fm","mh"]},
  {name:"New Zealand",code:"nz",region:"Oceania",similar:["au","gb","fj"]},
  {name:"Palau",code:"pw",region:"Oceania",similar:["jp","mh","fm"]},
  {name:"Papua New Guinea",code:"pg",region:"Oceania",similar:["sb","fj","ki"]},
  {name:"Samoa",code:"ws",region:"Oceania",similar:["nz","au","fj"]},
  {name:"Solomon Islands",code:"sb",region:"Oceania",similar:["pg","fj","ki"]},
  {name:"Tonga",code:"to",region:"Oceania",similar:["ws","fj","sb"]},
  {name:"Tuvalu",code:"tv",region:"Oceania",similar:["fj","ws","sb"]},
  {name:"Vanuatu",code:"vu",region:"Oceania",similar:["pg","sb","fj"]},
];

const cities = [
  {name:"London",country:"United Kingdom",lat:51.505,lng:-0.09,region:"Europe"},
  {name:"Paris",country:"France",lat:48.856,lng:2.352,region:"Europe"},
  {name:"Berlin",country:"Germany",lat:52.52,lng:13.405,region:"Europe"},
  {name:"Madrid",country:"Spain",lat:40.416,lng:-3.703,region:"Europe"},
  {name:"Rome",country:"Italy",lat:41.902,lng:12.496,region:"Europe"},
  {name:"Amsterdam",country:"Netherlands",lat:52.374,lng:4.899,region:"Europe"},
  {name:"Vienna",country:"Austria",lat:48.208,lng:16.373,region:"Europe"},
  {name:"Stockholm",country:"Sweden",lat:59.334,lng:18.063,region:"Europe"},
  {name:"Warsaw",country:"Poland",lat:52.229,lng:21.012,region:"Europe"},
  {name:"Budapest",country:"Hungary",lat:47.498,lng:19.039,region:"Europe"},
  {name:"Prague",country:"Czech Republic",lat:50.076,lng:14.437,region:"Europe"},
  {name:"Athens",country:"Greece",lat:37.983,lng:23.727,region:"Europe"},
  {name:"Lisbon",country:"Portugal",lat:38.716,lng:-9.139,region:"Europe"},
  {name:"Brussels",country:"Belgium",lat:50.85,lng:4.352,region:"Europe"},
  {name:"Oslo",country:"Norway",lat:59.913,lng:10.752,region:"Europe"},
  {name:"Copenhagen",country:"Denmark",lat:55.676,lng:12.568,region:"Europe"},
  {name:"Helsinki",country:"Finland",lat:60.169,lng:24.939,region:"Europe"},
  {name:"Zurich",country:"Switzerland",lat:47.377,lng:8.541,region:"Europe"},
  {name:"Dublin",country:"Ireland",lat:53.349,lng:-6.26,region:"Europe"},
  {name:"Kyiv",country:"Ukraine",lat:50.45,lng:30.523,region:"Europe"},
  {name:"Bucharest",country:"Romania",lat:44.426,lng:26.102,region:"Europe"},
  {name:"Belgrade",country:"Serbia",lat:44.817,lng:20.457,region:"Europe"},
  {name:"Reykjavik",country:"Iceland",lat:64.135,lng:-21.895,region:"Europe"},
  {name:"Tokyo",country:"Japan",lat:35.689,lng:139.692,region:"Asia"},
  {name:"Beijing",country:"China",lat:39.909,lng:116.397,region:"Asia"},
  {name:"Shanghai",country:"China",lat:31.228,lng:121.474,region:"Asia"},
  {name:"Mumbai",country:"India",lat:19.076,lng:72.877,region:"Asia"},
  {name:"Delhi",country:"India",lat:28.614,lng:77.209,region:"Asia"},
  {name:"Seoul",country:"South Korea",lat:37.566,lng:126.978,region:"Asia"},
  {name:"Bangkok",country:"Thailand",lat:13.754,lng:100.502,region:"Asia"},
  {name:"Jakarta",country:"Indonesia",lat:-6.208,lng:106.845,region:"Asia"},
  {name:"Singapore",country:"Singapore",lat:1.352,lng:103.82,region:"Asia"},
  {name:"Kuala Lumpur",country:"Malaysia",lat:3.148,lng:101.687,region:"Asia"},
  {name:"Manila",country:"Philippines",lat:14.599,lng:120.984,region:"Asia"},
  {name:"Taipei",country:"Taiwan",lat:25.047,lng:121.517,region:"Asia"},
  {name:"Karachi",country:"Pakistan",lat:24.861,lng:67.01,region:"Asia"},
  {name:"Dhaka",country:"Bangladesh",lat:23.811,lng:90.412,region:"Asia"},
  {name:"Colombo",country:"Sri Lanka",lat:6.927,lng:79.861,region:"Asia"},
  {name:"Kathmandu",country:"Nepal",lat:27.717,lng:85.319,region:"Asia"},
  {name:"Ulaanbaatar",country:"Mongolia",lat:47.886,lng:106.906,region:"Asia"},
  {name:"Tashkent",country:"Uzbekistan",lat:41.299,lng:69.24,region:"Asia"},
  {name:"Almaty",country:"Kazakhstan",lat:43.238,lng:76.889,region:"Asia"},
  {name:"Yangon",country:"Myanmar",lat:16.866,lng:96.195,region:"Asia"},
  {name:"Dubai",country:"UAE",lat:25.204,lng:55.27,region:"Middle East"},
  {name:"Istanbul",country:"Turkey",lat:41.015,lng:28.979,region:"Middle East"},
  {name:"Riyadh",country:"Saudi Arabia",lat:24.688,lng:46.722,region:"Middle East"},
  {name:"Tehran",country:"Iran",lat:35.694,lng:51.422,region:"Middle East"},
  {name:"Baghdad",country:"Iraq",lat:33.341,lng:44.401,region:"Middle East"},
  {name:"Amman",country:"Jordan",lat:31.956,lng:35.945,region:"Middle East"},
  {name:"Beirut",country:"Lebanon",lat:33.889,lng:35.495,region:"Middle East"},
  {name:"Tel Aviv",country:"Israel",lat:32.087,lng:34.798,region:"Middle East"},
  {name:"Doha",country:"Qatar",lat:25.286,lng:51.533,region:"Middle East"},
  {name:"Kuwait City",country:"Kuwait",lat:29.369,lng:47.978,region:"Middle East"},
  {name:"Cairo",country:"Egypt",lat:30.033,lng:31.233,region:"Africa"},
  {name:"Lagos",country:"Nigeria",lat:6.524,lng:3.379,region:"Africa"},
  {name:"Nairobi",country:"Kenya",lat:-1.292,lng:36.822,region:"Africa"},
  {name:"Johannesburg",country:"South Africa",lat:-26.204,lng:28.047,region:"Africa"},
  {name:"Cape Town",country:"South Africa",lat:-33.924,lng:18.424,region:"Africa"},
  {name:"Casablanca",country:"Morocco",lat:33.589,lng:-7.604,region:"Africa"},
  {name:"Accra",country:"Ghana",lat:5.556,lng:-0.197,region:"Africa"},
  {name:"Addis Ababa",country:"Ethiopia",lat:9.025,lng:38.747,region:"Africa"},
  {name:"Dar es Salaam",country:"Tanzania",lat:-6.792,lng:39.208,region:"Africa"},
  {name:"Khartoum",country:"Sudan",lat:15.552,lng:32.532,region:"Africa"},
  {name:"Dakar",country:"Senegal",lat:14.693,lng:-17.447,region:"Africa"},
  {name:"Tunis",country:"Tunisia",lat:36.819,lng:10.166,region:"Africa"},
  {name:"Lusaka",country:"Zambia",lat:-15.417,lng:28.283,region:"Africa"},
  {name:"Harare",country:"Zimbabwe",lat:-17.829,lng:31.052,region:"Africa"},
  {name:"New York",country:"United States",lat:40.713,lng:-74.006,region:"Americas"},
  {name:"Los Angeles",country:"United States",lat:34.052,lng:-118.244,region:"Americas"},
  {name:"Chicago",country:"United States",lat:41.878,lng:-87.629,region:"Americas"},
  {name:"Toronto",country:"Canada",lat:43.653,lng:-79.383,region:"Americas"},
  {name:"São Paulo",country:"Brazil",lat:-23.55,lng:-46.633,region:"Americas"},
  {name:"Buenos Aires",country:"Argentina",lat:-34.603,lng:-58.381,region:"Americas"},
  {name:"Mexico City",country:"Mexico",lat:19.432,lng:-99.133,region:"Americas"},
  {name:"Lima",country:"Peru",lat:-12.046,lng:-77.043,region:"Americas"},
  {name:"Bogotá",country:"Colombia",lat:4.711,lng:-74.072,region:"Americas"},
  {name:"Santiago",country:"Chile",lat:-33.459,lng:-70.648,region:"Americas"},
  {name:"Caracas",country:"Venezuela",lat:10.48,lng:-66.903,region:"Americas"},
  {name:"Havana",country:"Cuba",lat:23.136,lng:-82.359,region:"Americas"},
  {name:"Quito",country:"Ecuador",lat:-0.229,lng:-78.524,region:"Americas"},
  {name:"Montevideo",country:"Uruguay",lat:-34.901,lng:-56.188,region:"Americas"},
  {name:"Vancouver",country:"Canada",lat:49.283,lng:-123.121,region:"Americas"},
  {name:"Sydney",country:"Australia",lat:-33.869,lng:151.208,region:"Oceania"},
  {name:"Melbourne",country:"Australia",lat:-37.813,lng:144.963,region:"Oceania"},
  {name:"Auckland",country:"New Zealand",lat:-36.867,lng:174.77,region:"Oceania"},
  {name:"Wellington",country:"New Zealand",lat:-41.286,lng:174.776,region:"Oceania"},
  {name:"Brisbane",country:"Australia",lat:-27.469,lng:153.025,region:"Oceania"},
  {name:"Perth",country:"Australia",lat:-31.95,lng:115.86,region:"Oceania"},
  {name:"Suva",country:"Fiji",lat:-18.141,lng:178.441,region:"Oceania"},
];

/* ─── HELPERS ─── */
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function codeToEmoji(code) {
  if (code === "xk") return "🇽🇰";
  return code.toUpperCase().split("").map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join("");
}
function getDistractors(correct) {
  let d = [];
  for (const f of (correct.similar || [])) {
    const m = countries.find(c => c.code === f && c.name !== correct.name);
    if (m) d.push(m);
  }
  if (d.length < 2) {
    const reg = shuffle(countries.filter(c => c.name !== correct.name && c.region === correct.region && !d.find(x => x.name === c.name)));
    d = [...d, ...reg];
  }
  if (d.length < 2) {
    const others = shuffle(countries.filter(c => c.name !== correct.name && !d.find(x => x.name === c.name)));
    d = [...d, ...others];
  }
  return d.slice(0, 2);
}

/* ─── CSS-IN-JS ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --bg: #0a0e1a;
    --surface: #111827;
    --card: #1a2235;
    --border: #243050;
    --text: #e8eaf0;
    --muted: #5a6a8a;
    --accent: #00d4ff;
    --accent2: #7c3aed;
    --green: #00e5a0;
    --red: #ff4757;
    --gold: #ffd700;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; width: 100%; overflow-x: hidden; }

  /* ── LAYOUT ── */
  html, body, #root {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }
  .gm-root {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,255,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 80% 110%, rgba(124,58,237,0.06) 0%, transparent 60%);
    padding-bottom: 80px;
  }

  /* ── HEADER ── */
  .gm-header {
    width: 100%;
    background: rgba(10,14,26,0.95);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  .gm-brand {
    font-family: 'Orbitron', monospace;
    font-weight: 900;
    font-size: 1.15rem;
    letter-spacing: 6px;
    color: var(--accent);
    text-shadow: 0 0 20px rgba(0,212,255,0.4);
    text-transform: uppercase;
  }
  .gm-brand span { color: var(--text); }
  .gm-brand { cursor: pointer; }
  .gm-brand:hover { opacity: 0.8; }
  .gm-quit-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 5px 14px;
    border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  .gm-quit-btn:hover { border-color: var(--red); color: var(--red); }

  /* ── BOTTOM NAV ── */
  .gm-bnav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: rgba(10,14,26,0.98);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: center;
    z-index: 1000;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    backdrop-filter: blur(16px);
  }
  .gm-bnav-inner {
    display: flex;
    width: 100%;
    max-width: 620px;
  }
  .gm-bnav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 4px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 0.6rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: color 0.2s;
    gap: 4px;
    -webkit-tap-highlight-color: transparent;
  }
  .gm-bnav-icon { font-size: 1.4rem; line-height: 1; transition: transform 0.2s; }
  .gm-bnav-btn.active { color: var(--accent); }
  .gm-bnav-btn.active .gm-bnav-icon { transform: translateY(-2px); }

  /* ── PAGE & SCREEN ── */
  .gm-page { display: none; width: 100%; max-width: 620px; margin: 0 auto; padding: 24px 16px 24px; flex-direction: column; align-items: center; }
  .gm-page.active { display: flex; }
  .gm-screen { display: none; flex-direction: column; align-items: center; text-align: center; width: 100%; }
  .gm-screen.active { display: flex; }

  /* ── START SCREENS ── */
  .gm-screen-icon { font-size: 3.5rem; margin-bottom: 12px; }
  .gm-screen-title {
    font-family: 'Orbitron', monospace;
    font-weight: 900;
    font-size: 2.2rem;
    letter-spacing: 3px;
    color: var(--text);
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .gm-screen-sub { color: var(--muted); margin-bottom: 20px; font-size: 0.9rem; max-width: 360px; line-height: 1.6; }

  .gm-section-label {
    color: var(--accent);
    font-size: 0.65rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 10px;
    margin-top: 6px;
    font-weight: 700;
  }

  /* ── PILLS ── */
  .gm-pill-group { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 18px; }
  .gm-pill {
    padding: 8px 16px;
    border-radius: 30px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.15s;
  }
  .gm-pill:hover { border-color: var(--accent); color: var(--accent); }
  .gm-pill.selected { border-color: var(--accent); color: var(--accent); background: rgba(0,212,255,0.08); }

  /* ── BTN ── */
  .gm-btn {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff;
    border: none;
    padding: 14px 48px;
    border-radius: 50px;
    font-family: 'Orbitron', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: all 0.2s;
    margin-top: 12px;
    box-shadow: 0 0 24px rgba(0,212,255,0.2);
  }
  .gm-btn:hover { transform: translateY(-2px); box-shadow: 0 0 32px rgba(0,212,255,0.35); }

  /* ── STATS BAR ── */
  .gm-stats-bar {
    display: flex;
    margin-bottom: 16px;
    background: var(--surface);
    border-radius: 14px;
    border: 1px solid var(--border);
    overflow: hidden;
    width: 100%;
  }
  .gm-stat { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 8px; border-right: 1px solid var(--border); }
  .gm-stat:last-child { border-right: none; }
  .gm-stat-label { color: var(--muted); font-size: 0.55rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2px; font-weight: 700; }
  .gm-stat-value { color: var(--accent); font-family: 'Orbitron', monospace; font-size: 0.9rem; font-weight: 700; }

  /* ── PROGRESS BAR ── */
  .gm-progress-wrap { height: 3px; background: var(--border); border-radius: 10px; margin-bottom: 16px; overflow: hidden; width: 100%; }
  .gm-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 10px; transition: width 0.4s ease; }

  /* ── TIMER BAR ── */
  .gm-timer-wrap { height: 4px; background: var(--border); border-radius: 10px; margin-bottom: 14px; overflow: hidden; width: 100%; }
  .gm-timer-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.1s linear, background 0.5s;
  }

  /* ── GAME CARD (flags) ── */
  .gm-game-card {
    background: var(--surface);
    border-radius: 20px;
    padding: 24px 20px;
    width: 100%;
    border: 1px solid var(--border);
  }
  .gm-question-label { text-align: center; color: var(--muted); font-size: 0.65rem; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; }
  .gm-country-prompt {
    text-align: center;
    font-family: 'Orbitron', monospace;
    font-size: clamp(1.6rem, 6vw, 2.6rem);
    letter-spacing: 2px;
    color: var(--text);
    margin-bottom: 4px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
  }
  .gm-region-tag { text-align: center; color: var(--muted); font-size: 0.65rem; margin-bottom: 18px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }

  .gm-flags-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; width: 100%; }
  .gm-flag-card {
    background: var(--card);
    border: 2px solid var(--border);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 5/3;
    padding: 0;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s, background 0.15s;
    overflow: hidden;
    position: relative;
  }
  .gm-flag-card img { width: 100%; height: 100%; object-fit: contain; display: block; padding: 6px; }
  .gm-flag-emoji { font-size: clamp(1.8rem, 6vw, 2.8rem); line-height: 1; }
  .gm-flag-card:hover:not(:disabled) { border-color: var(--accent); transform: translateY(-3px); background: rgba(0,212,255,0.05); }
  .gm-flag-card:disabled { cursor: default; }
  .gm-flag-card.correct { border-color: var(--green); background: rgba(0,229,160,0.1); animation: flagPop 0.35s ease; }
  .gm-flag-card.wrong { border-color: var(--red); background: rgba(255,71,87,0.1); animation: flagShake 0.35s ease; }
  @keyframes flagPop { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
  @keyframes flagShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

  .gm-result-msg { text-align: center; margin-top: 12px; font-size: 0.9rem; font-weight: 700; min-height: 22px; }
  .gm-result-msg.correct { color: var(--green); }
  .gm-result-msg.wrong { color: var(--red); }

  /* ── END SCREENS ── */
  .gm-final-score {
    font-family: 'Orbitron', monospace;
    font-size: 4.5rem;
    color: var(--accent);
    line-height: 1;
    margin-bottom: 6px;
    font-weight: 900;
    text-shadow: 0 0 30px rgba(0,212,255,0.3);
  }
  .gm-missed-list { max-height: 200px; overflow-y: auto; width: 100%; margin: 10px 0 20px; background: var(--surface); border-radius: 12px; border: 1px solid var(--border); }
  .gm-missed-item { display: flex; align-items: center; gap: 12px; padding: 8px 14px; border-bottom: 1px solid var(--border); font-size: 0.85rem; color: var(--muted); }
  .gm-missed-item:last-child { border-bottom: none; }
  .gm-missed-region { margin-left: auto; font-size: 0.7rem; color: var(--muted); }

  /* ── CITY CARD ── */
  .gm-city-card { background: var(--surface); border-radius: 20px; overflow: hidden; width: 100%; border: 1px solid var(--border); }
  .gm-city-question-bar { padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
  .gm-city-name { font-family: 'Orbitron', monospace; font-size: clamp(1.4rem, 5vw, 2rem); letter-spacing: 2px; color: var(--text); line-height: 1; font-weight: 900; }
  .gm-city-country { color: var(--muted); font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; font-weight: 700; }

  #gm-map-wrap { width: 100%; height: 400px; position: relative; background: #1a3a5c; overflow: hidden; }
  #gm-map-wrap svg { display: block; cursor: crosshair; }
  .gm-map-loading { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.9rem; color: var(--muted); font-weight: 700; background: rgba(26,58,92,0.92); z-index: 5; gap: 10px; text-align: center; padding: 20px; }
  .gm-map-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .gm-zoom-controls { position: absolute; top: 10px; right: 10px; z-index: 10; display: flex; flex-direction: column; gap: 4px; }
  .gm-zoom-btn { width: 34px; height: 34px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; font-size: 1.1rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: var(--text); font-family: monospace; }
  .gm-zoom-btn:hover { background: var(--card); }

  .gm-confirm-bar { display: none; align-items: center; gap: 10px; padding: 12px 16px; background: var(--card); border-top: 1px solid var(--border); }
  .gm-confirm-bar.visible { display: flex; }
  .gm-confirm-label { flex: 1; font-size: 0.82rem; color: var(--muted); }
  .gm-confirm-label strong { color: var(--text); }
  .gm-cbtn { padding: 9px 18px; border-radius: 30px; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.82rem; cursor: pointer; border: none; }
  .gm-cbtn.cancel { background: var(--border); color: var(--muted); }
  .gm-cbtn.go { background: var(--green); color: #0a0e1a; }

  .gm-city-result-bar { padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; background: var(--card); border-top: 1px solid var(--border); min-height: 54px; }
  .gm-city-result-text { font-weight: 700; font-size: 0.9rem; }
  .gm-city-result-text.correct { color: var(--green); }
  .gm-city-result-text.wrong { color: var(--red); }
  .gm-city-result-text.waiting { color: var(--muted); font-style: italic; font-weight: 500; }

  .gm-next-btn {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff;
    border: none;
    padding: 9px 22px;
    border-radius: 30px;
    font-family: 'Orbitron', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 1px;
    text-transform: uppercase;
    display: none;
  }
  .gm-next-btn.visible { display: block; }

  .gm-city-total-score {
    font-family: 'Orbitron', monospace;
    font-size: 3.8rem;
    color: var(--accent);
    line-height: 1;
    margin: 8px 0 4px;
    font-weight: 900;
    text-shadow: 0 0 30px rgba(0,212,255,0.3);
  }
  .gm-city-total-label { color: var(--muted); font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
  .gm-city-breakdown { width: 100%; background: var(--surface); border-radius: 12px; border: 1px solid var(--border); margin-bottom: 20px; }
  .gm-cbi { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
  .gm-cbi:last-child { border-bottom: none; }
  .gm-cbi-name { flex: 1; font-weight: 700; font-size: 0.85rem; }
  .gm-cbi-country { color: var(--muted); font-size: 0.72rem; }
  .gm-score-ring { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; border: 2px solid var(--border); font-family: 'Orbitron', monospace; font-size: 0.8rem; color: var(--text); flex-shrink: 0; }
  .gm-score-ring.great { border-color: var(--green); color: var(--green); }
  .gm-score-ring.good  { border-color: #f59e0b; color: #f59e0b; }
  .gm-score-ring.ok    { border-color: #ea580c; color: #ea580c; }
  .gm-score-ring.bad   { border-color: var(--red); color: var(--red); }

  /* ── LEADERBOARD ── */
  .gm-lb-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 8px; }
  .gm-lb-rank { font-family: 'Orbitron', monospace; font-size: 1.1rem; width: 36px; text-align: center; flex-shrink: 0; color: var(--muted); font-weight: 700; }
  .gm-lb-rank.gold   { color: var(--gold); text-shadow: 0 0 10px rgba(255,215,0,0.4); }
  .gm-lb-rank.silver { color: #94a3b8; }
  .gm-lb-rank.bronze { color: #b45309; }
  .gm-lb-name { flex: 1; font-weight: 700; font-size: 0.95rem; }
  .gm-lb-score { font-family: 'Orbitron', monospace; font-size: 1rem; color: var(--accent); font-weight: 700; }
  .gm-lb-meta { font-size: 0.72rem; color: var(--muted); }
  .gm-lb-empty { text-align: center; padding: 40px 20px; color: var(--muted); }

  .gm-lb-submit { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-top: 12px; width: 100%; }
  .gm-lb-submit-title { font-weight: 700; margin-bottom: 8px; font-size: 0.9rem; color: var(--text); }
  .gm-lb-input {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    margin-bottom: 10px;
  }
  .gm-lb-input:focus { border-color: var(--accent); }
`;

/* ─── INJECT STYLES ─── */
const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);

/* ════════════════════════════════════════
   FLAG GAME COMPONENT
════════════════════════════════════════ */
const QUESTION_TIME = 15; // seconds per flag question

/* ── Single flag card — tracks img error in state so only one flag ever shows ── */
function FlagCard({ country, state, disabled, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <button className={`gm-flag-card${state ? ` ${state}` : ""}`} disabled={disabled} onClick={onClick}>
      {imgFailed
        ? <span className="gm-flag-emoji">{codeToEmoji(country.code)}</span>
        : <img src={`/flags/${country.code.toUpperCase()}.png`} alt={country.name} onError={() => setImgFailed(true)} />
      }
    </button>
  );
}

function FlagGame({ onSubmitScore, onHome }) {
  const [screen, setScreen] = useState("start"); // start | game | end
  const [fTotal, setFTotal] = useState(20);
  const [fRegion, setFRegion] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [missed, setMissed] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [resultMsg, setResultMsg] = useState({ text: "", type: "" });
  const [cardStates, setCardStates] = useState([null, null, null]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startGame = () => {
    const pool = fRegion === "all" ? countries : countries.filter(c => c.region === fRegion);
    const q = Math.min(fTotal, pool.length);
    const qs = shuffle(pool).slice(0, q).map(correct => ({
      correct, options: shuffle([correct, ...getDistractors(correct)])
    }));
    setQuestions(qs);
    setScore(0); setLives(3); setCurrent(0); setStreak(0); setMaxStreak(0);
    setMissed([]); setAnswered(false); setResultMsg({ text: "", type: "" });
    setCardStates([null, null, null]);
    setScreen("game");
  };

  // Timer effect
  useEffect(() => {
    if (screen !== "game" || answered) return;
    setTimeLeft(QUESTION_TIME);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, QUESTION_TIME - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleAnswer(null, -1, true); // time out
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [screen, current, answered]);

  const handleAnswer = useCallback((chosen, chosenIdx, timedOut = false) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);

    const q = questions[current];
    const correct = !timedOut && chosen?.name === q.correct.name;
    const correctIdx = q.options.findIndex(c => c.name === q.correct.name);

    const newCards = [null, null, null];
    newCards[correctIdx] = "correct";
    if (!correct && chosenIdx >= 0) newCards[chosenIdx] = "wrong";
    setCardStates(newCards);

    // Time bonus: faster = more points (up to 200 bonus pts in 8s)
    const elapsed = timedOut ? QUESTION_TIME : (Date.now() - startTimeRef.current) / 1000;
    const timeBonus = correct ? Math.round(Math.max(0, (QUESTION_TIME - elapsed) / QUESTION_TIME) * 200) : 0;
    const basePoints = correct ? 100 : 0;
    const pts = basePoints + timeBonus;

    let newScore = score;
    let newLives = lives;
    let newStreak = streak;
    let newMaxStreak = maxStreak;
    let newMissed = missed;

    if (correct) {
      newScore = score + pts;
      newStreak = streak + 1;
      newMaxStreak = Math.max(maxStreak, newStreak);
      const msgs = ["✅ Correct!", "⭐ Nice one!", "✅ Got it!"];
      setResultMsg({
        text: newStreak >= 3 ? `🔥 ${newStreak} in a row! +${pts}` : `${msgs[Math.floor(Math.random() * 3)]} +${pts}`,
        type: "correct"
      });
    } else {
      newLives = lives - 1;
      newStreak = 0;
      newMissed = [...missed, q.correct];
      setResultMsg({
        text: timedOut ? `⏱️ Too slow! Answer: ${q.correct.name}` : `❌ That's ${chosen?.name}. Answer: ${q.correct.name}`,
        type: "wrong"
      });
    }

    setScore(newScore); setLives(newLives); setStreak(newStreak);
    setMaxStreak(newMaxStreak); setMissed(newMissed);

    setTimeout(() => {
      const nextIdx = current + 1;
      if (newLives <= 0 || nextIdx >= questions.length) {
        setScreen("end");
        const pct = Math.round((newScore / ((questions.length * (100 + 100))) * 100));
        onSubmitScore && onSubmitScore("flag", newScore, `${questions.length} questions`);
      } else {
        setCurrent(nextIdx);
        setAnswered(false);
        setResultMsg({ text: "", type: "" });
        setCardStates([null, null, null]);
      }
    }, 1600);
  }, [answered, questions, current, score, lives, streak, maxStreak, missed]);

  const q = questions[current];
  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timerPct > 50 ? "var(--accent)" : timerPct > 25 ? "#f59e0b" : "var(--red)";

  if (screen === "start") return (
    <div className="gm-screen active">
      <div className="gm-screen-icon">🏴‍☠️</div>
      <div className="gm-screen-title">Flag Master</div>
      <p className="gm-screen-sub">Three flags appear — tap the one that matches the country shown. Answer faster for bonus points!</p>
      <div className="gm-section-label">Questions</div>
      <div className="gm-pill-group">
        {[10, 20, 40, 195].map(n => (
          <button key={n} className={`gm-pill${fTotal === n ? " selected" : ""}`} onClick={() => setFTotal(n)}>
            {n === 195 ? "All 195 🔥" : n}
          </button>
        ))}
      </div>
      <div className="gm-section-label">Region</div>
      <div className="gm-pill-group">
        {[["all","🌎 All"],["Europe","🇪🇺 Europe"],["Asia","🌏 Asia"],["Africa","🌍 Africa"],["Americas","🌎 Americas"],["Oceania","🏝️ Oceania"],["Middle East","🕌 Middle East"]].map(([r, label]) => (
          <button key={r} className={`gm-pill${fRegion === r ? " selected" : ""}`} onClick={() => setFRegion(r)}>{label}</button>
        ))}
      </div>
      <button className="gm-btn" onClick={startGame}>Start Game</button>
    </div>
  );

  if (screen === "end") {
    const totalPossible = questions.length * 300; // max 300 per q (100 base + 200 time bonus)
    const pct = Math.round((score / (questions.length * 100)) * 100);
    let icon, title, sub;
    if (pct === 100) { icon = "🏆"; title = "Perfect!"; sub = `Flawless! Best streak: ${maxStreak}`; }
    else if (pct >= 80) { icon = "🌟"; title = "Excellent!"; sub = `${pct}% · Streak: ${maxStreak}`; }
    else if (pct >= 60) { icon = "👍"; title = "Good Job!"; sub = `${pct}% correct`; }
    else if (lives <= 0) { icon = "💔"; title = "Out of Lives!"; sub = `${score} points scored`; }
    else { icon = "🌍"; title = "Keep Going!"; sub = `${pct}% correct`; }
    return (
      <div className="gm-screen active">
        <div className="gm-screen-icon">{icon}</div>
        <div className="gm-screen-title">{title}</div>
        <div className="gm-final-score">{score}</div>
        <p style={{color:"var(--muted)",fontSize:"0.75rem",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"4px"}}>POINTS</p>
        <p className="gm-screen-sub">{sub}</p>
        {missed.length > 0 && (
          <div className="gm-missed-list">
            {missed.map((c, i) => (
              <div className="gm-missed-item" key={i}>
                <img src={`/flags/${c.code.toUpperCase()}.png`} alt={c.name} style={{width:40,height:28,objectFit:"contain",borderRadius:4}} onError={e=>e.target.style.display='none'} />
                <span style={{flex:1,fontWeight:700}}>{c.name}</span>
                <span className="gm-missed-region">{c.region}</span>
              </div>
            ))}
          </div>
        )}
        <LbSubmit game="flags" score={score} detail={`${questions.length} questions`} />
        <button className="gm-btn" onClick={() => setScreen("start")} style={{marginTop:8}}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="gm-screen active">
      <div style={{display:"flex",justifyContent:"flex-end",width:"100%",marginBottom:8}}>
        <button className="gm-quit-btn" onClick={() => { clearInterval(timerRef.current); setScreen("start"); }}>✕ Quit</button>
      </div>
      <div className="gm-stats-bar">
        <div className="gm-stat"><span className="gm-stat-label">Score</span><span className="gm-stat-value">{score}</span></div>
        <div className="gm-stat"><span className="gm-stat-label">Q</span><span className="gm-stat-value">{current + 1}/{questions.length}</span></div>
        <div className="gm-stat"><span className="gm-stat-label">Streak</span><span className="gm-stat-value">{streak}🔥</span></div>
        <div className="gm-stat"><span className="gm-stat-label">Lives</span><span className="gm-stat-value" style={{fontSize:"0.75rem"}}>{"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}</span></div>
      </div>
      <div className="gm-progress-wrap"><div className="gm-progress-fill" style={{width:`${(current/questions.length)*100}%`}} /></div>
      <div className="gm-timer-wrap"><div className="gm-timer-fill" style={{width:`${timerPct}%`, background: timerColor}} /></div>
      <div className="gm-game-card">
        <div className="gm-question-label">Which flag belongs to</div>
        <div className="gm-country-prompt">{q?.correct.name}</div>
        <div className="gm-region-tag">{q?.correct.region}</div>
        <div className="gm-flags-row">
          {q?.options.map((c, i) => (
            <FlagCard
              key={`${current}-${i}`}
              country={c}
              state={cardStates[i]}
              disabled={answered}
              onClick={() => handleAnswer(c, i)}
            />
          ))}
        </div>
        <div className={`gm-result-msg${resultMsg.type ? ` ${resultMsg.type}` : ""}`}>{resultMsg.text}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAP / CITY GAME COMPONENT
════════════════════════════════════════ */
function CityGame({ onSubmitScore }) {
  const [screen, setScreen] = useState("start");
  const [cTotal, setCTotal] = useState(10);
  const [cRegion, setCRegion] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [resultText, setResultText] = useState({ text: "", type: "waiting" });
  const [nextVisible, setNextVisible] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef({});
  const wrapRef = useRef(null);

  const startGame = () => {
    const pool = cRegion === "all" ? cities : cities.filter(c => c.region === cRegion);
    const qs = shuffle(pool).slice(0, Math.min(cTotal, pool.length));
    setQuestions(qs); setScore(0); setCurrent(0); setResults([]);
    setConfirmed(false); setPendingPin(null);
    setResultText({ text: "", type: "waiting" });
    setNextVisible(false); setScreen("game");
  };

  // Init map when screen becomes game
  useEffect(() => {
    if (screen !== "game") return;
    setMapLoading(true);
    const init = async () => {
      await loadD3();
      setTimeout(() => initD3Map(), 100);
    };
    init();
    return () => {
      const m = mapRef.current;
      if (m.svg) m.svg.remove();
      Object.assign(mapRef.current, { svg: null, g: null, projection: null, path: null, zoom: null, initialized: false });
    };
  }, [screen]);

  // Reset map markers on question change
  useEffect(() => {
    if (screen !== "game" || !mapRef.current.g) return;
    const { g, projection, path } = mapRef.current;
    g.selectAll("circle, line, text").remove();
    // Re-add graticule
    const graticule = window.d3.geoGraticule()();
    g.insert("path", ":first-child").datum(graticule).attr("fill","none").attr("stroke","#2a5a7a").attr("stroke-width",0.5).attr("d",path);
    resetZoom();
    setConfirmed(false);
    setPendingPin(null);
    setResultText({ text: "", type: "waiting" });
    setNextVisible(false);
    document.getElementById("gm-confirm-bar")?.classList.remove("visible");
    document.getElementById("gm-next-btn")?.classList.remove("visible");
    const q = questions[current];
    if (q) {
      const nameEl = document.getElementById("gm-city-name-disp");
      if (nameEl) nameEl.textContent = q.name;
    }
  }, [current, screen]);

  function initD3Map() {
    if (mapRef.current.initialized) return;
    const d3 = window.d3;
    const topojson = window.topojson;
    if (!d3 || !topojson) return;
    const wrap = document.getElementById("gm-map-wrap");
    if (!wrap) return;
    mapRef.current.initialized = true;
    const W = wrap.clientWidth || 580, H = 380;
    const projection = d3.geoNaturalEarth1().scale(W / 6.5).translate([W / 2, H / 2]);
    const path = d3.geoPath().projection(projection);
    const svg = d3.select("#gm-map-wrap").append("svg").attr("width", W).attr("height", H).style("display","block");
    svg.append("rect").attr("width", W).attr("height", H).attr("fill", "#1a3a5c");
    const g = svg.append("g").attr("id","gm-map-g");
    const graticule = d3.geoGraticule()();
    g.append("path").datum(graticule).attr("fill","none").attr("stroke","#2a5a7a").attr("stroke-width",0.5).attr("d",path);
    const zoom = d3.zoom().scaleExtent([1,50]).on("zoom", event => {
      g.attr("transform", event.transform);
      g.selectAll(".gm-country").attr("stroke-width", 0.5 / event.transform.k);
    });
    svg.call(zoom);
    let clickMoved = false;
    svg.on("mousedown touchstart", () => { clickMoved = false; }, true)
       .on("mousemove touchmove", () => { clickMoved = true; }, true);
    svg.on("click", event => {
      const confirmedRef = mapRef.current.confirmedRef;
      if (confirmedRef || clickMoved) return;
      const pt = d3.pointer(event, svg.node());
      const transform = d3.zoomTransform(svg.node());
      const baseCoords = transform.invert(pt);
      const lonlat = projection.invert(baseCoords);
      if (!lonlat || isNaN(lonlat[0]) || isNaN(lonlat[1])) return;
      placePin(lonlat[0], lonlat[1]);
    });
    mapRef.current = { ...mapRef.current, svg, g, projection, path, zoom, initialized: true, confirmedRef: false };
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(world => {
        const countries = topojson.feature(world, world.objects.countries);
        g.selectAll(".gm-country").data(countries.features).join("path")
          .attr("class","gm-country").attr("d",path)
          .attr("fill","#2d6a4f").attr("stroke","#1a4a35").attr("stroke-width",0.5);
        setMapLoading(false);
      })
      .catch(() => { setMapLoading(false); setMapError(true); });
  }

  function placePin(lon, lat) {
    const { g, projection, svg } = mapRef.current;
    const d3 = window.d3;
    g.select("#gm-pin-prov").remove();
    const xy = projection([lon, lat]);
    const k = d3.zoomTransform(svg.node()).k;
    g.append("circle").attr("id","gm-pin-prov")
      .attr("cx",xy[0]).attr("cy",xy[1])
      .attr("r",7/k).attr("fill","var(--accent)").attr("stroke","#fff").attr("stroke-width",2.5/k)
      .style("pointer-events","none");
    mapRef.current.pendingPin = { lon, lat };
    setPendingPin({ lon, lat });
    document.getElementById("gm-confirm-bar")?.classList.add("visible");
  }

  function cancelPin() {
    const { g } = mapRef.current;
    g.select("#gm-pin-prov").remove();
    mapRef.current.pendingPin = null;
    setPendingPin(null);
    document.getElementById("gm-confirm-bar")?.classList.remove("visible");
  }

  function confirmPin() {
    const { g, projection, svg, zoom, pendingPin: pp } = mapRef.current;
    if (!pp || mapRef.current.confirmedRef) return;
    mapRef.current.confirmedRef = true;
    setConfirmed(true);
    const d3 = window.d3;
    g.select("#gm-pin-prov").remove();
    const q = questions[current];
    const gxy = projection([pp.lon, pp.lat]);
    const axy = projection([q.lng, q.lat]);
    const lineK = d3.zoomTransform(svg.node()).k;
    g.append("line").attr("class","gm-result-pin")
      .attr("x1",gxy[0]).attr("y1",gxy[1]).attr("x2",axy[0]).attr("y2",axy[1])
      .attr("stroke","#8899aa").attr("stroke-width",1.5/lineK).attr("stroke-dasharray",`${5/lineK} ${3/lineK}`).attr("opacity",0.8)
      .style("pointer-events","none");
    const k = d3.zoomTransform(svg.node()).k;
    g.append("circle").attr("class","gm-result-pin").attr("cx",gxy[0]).attr("cy",gxy[1])
      .attr("r",7/k).attr("fill","var(--red)").attr("stroke","#fff").attr("stroke-width",2.5/k).style("pointer-events","none");
    g.append("circle").attr("class","gm-result-pin").attr("cx",axy[0]).attr("cy",axy[1])
      .attr("r",8/k).attr("fill","var(--green)").attr("stroke","#fff").attr("stroke-width",2.5/k).style("pointer-events","none");
    g.append("text").attr("class","gm-result-pin")
      .attr("x",axy[0]).attr("y",axy[1]-14/k).attr("text-anchor","middle")
      .attr("font-size",11/k).attr("font-weight","bold").attr("fill","#e8eaf0")
      .attr("font-family","DM Sans, sans-serif").style("pointer-events","none").text(q.name);
    const W = +svg.attr("width"), H = +svg.attr("height");
    const x0=Math.min(gxy[0],axy[0])-60, x1=Math.max(gxy[0],axy[0])+60;
    const y0=Math.min(gxy[1],axy[1])-60, y1=Math.max(gxy[1],axy[1])+60;
    const scale = Math.min(10, 0.85/Math.max((x1-x0)/W,(y1-y0)/H));
    const tx=W/2-scale*(x0+x1)/2, ty=H/2-scale*(y0+y1)/2;
    svg.transition().duration(700).call(zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(scale));
    // Score
    const R=6371, dLat=(q.lat-pp.lat)*Math.PI/180, dLng=(q.lng-pp.lon)*Math.PI/180;
    const a=Math.sin(dLat/2)**2+Math.cos(pp.lat*Math.PI/180)*Math.cos(q.lat*Math.PI/180)*Math.sin(dLng/2)**2;
    const dist=Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
    const pts=Math.round(Math.max(0,1000-dist*0.8));
    const newScore = score + pts;
    const newResults = [...results, {name:q.name,country:q.country,dist,pts}];
    setScore(newScore); setResults(newResults);
    let txt, type;
    if(dist<50){txt=`🎯 Incredible! ${dist} km off — +${pts}`;type="correct";}
    else if(dist<300){txt=`✅ Great! ${dist} km — +${pts}`;type="correct";}
    else if(dist<1000){txt=`👍 Not bad! ${dist} km — +${pts}`;type="correct";}
    else{txt=`❌ ${dist} km off — +${pts}`;type="wrong";}
    setResultText({text:txt,type});
    document.getElementById("gm-confirm-bar")?.classList.remove("visible");
    setNextVisible(true);
  }

  function resetZoom() {
    const { svg, zoom } = mapRef.current;
    if (!svg || !zoom) return;
    svg.transition().duration(400).call(zoom.transform, window.d3.zoomIdentity);
  }

  function nextQuestion() {
    mapRef.current.confirmedRef = false;
    const next = current + 1;
    if (next >= questions.length) { setScreen("end"); }
    else { setCurrent(next); }
  }

  if (screen === "start") return (
    <div className="gm-screen active">
      <div className="gm-screen-icon">📍</div>
      <div className="gm-screen-title">City Locator</div>
      <p className="gm-screen-sub">A city name appears — drop your pin on the map. Closer = more points!</p>
      <div className="gm-section-label">Cities</div>
      <div className="gm-pill-group">
        {[5,10,20,50].map(n=>(
          <button key={n} className={`gm-pill${cTotal===n?" selected":""}`} onClick={()=>setCTotal(n)}>{n}</button>
        ))}
      </div>
      <div className="gm-section-label">Region</div>
      <div className="gm-pill-group">
        {[["all","🌎 All"],["Europe","🇪🇺 Europe"],["Asia","🌏 Asia"],["Africa","🌍 Africa"],["Americas","🌎 Americas"],["Oceania","🏝️ Oceania"],["Middle East","🕌 Middle East"]].map(([r,label])=>(
          <button key={r} className={`gm-pill${cRegion===r?" selected":""}`} onClick={()=>setCRegion(r)}>{label}</button>
        ))}
      </div>
      <button className="gm-btn" onClick={startGame}>Start Game</button>
    </div>
  );

  if (screen === "end") {
    const maxPts = questions.length * 1000;
    const pct = Math.round((score / maxPts) * 100);
    let icon, title, sub;
    if(pct>=90){icon="🏆";title="Incredible!";sub="You really know your geography!";}
    else if(pct>=70){icon="🌟";title="Excellent!";sub="Outstanding knowledge!";}
    else if(pct>=50){icon="👍";title="Good Job!";sub="Pretty solid — keep practising!";}
    else{icon="🌍";title="Keep Exploring!";sub="Every game makes you better!";}
    return (
      <div className="gm-screen active">
        <div className="gm-screen-icon">{icon}</div>
        <div className="gm-screen-title">{title}</div>
        <div className="gm-city-total-score">{score.toLocaleString()}</div>
        <div className="gm-city-total-label">points out of {maxPts.toLocaleString()}</div>
        <p className="gm-screen-sub">{sub}</p>
        <div className="gm-city-breakdown">
          {results.map((r,i)=>{
            const cls = r.dist<50?"great":r.dist<300?"good":r.dist<1000?"ok":"bad";
            return (
              <div className="gm-cbi" key={i}>
                <div><div className="gm-cbi-name">{r.name}</div><div className="gm-cbi-country">{r.country}</div></div>
                <div className={`gm-score-ring ${cls}`}>{r.pts}</div>
              </div>
            );
          })}
        </div>
        <LbSubmit game="cities" score={score} detail={`${questions.length} cities`} />
        <button className="gm-btn" onClick={() => setScreen("start")} style={{marginTop:8}}>Play Again</button>
      </div>
    );
  }

  const q = questions[current];
  const avgKm = results.length ? Math.round(results.reduce((s,r)=>s+r.dist,0)/results.length) : null;
  const bestKm = results.length ? Math.round(Math.min(...results.map(r=>r.dist))) : null;

  return (
    <div className="gm-screen active">
      <div className="gm-stats-bar">
      <div style={{display:"flex",justifyContent:"flex-end",width:"100%",marginBottom:8}}>
        <button className="gm-quit-btn" onClick={() => setScreen("start")}>✕ Quit</button>
      </div>
        <div className="gm-stat"><span className="gm-stat-label">Points</span><span className="gm-stat-value">{score}</span></div>
        <div className="gm-stat"><span className="gm-stat-label">City</span><span className="gm-stat-value">{current+1}/{questions.length}</span></div>
        <div className="gm-stat"><span className="gm-stat-label">Best</span><span className="gm-stat-value">{bestKm!=null?`${bestKm}km`:"—"}</span></div>
        <div className="gm-stat"><span className="gm-stat-label">Avg km</span><span className="gm-stat-value">{avgKm!=null?avgKm:"—"}</span></div>
      </div>
      <div className="gm-city-card">
        <div className="gm-city-question-bar">
          <div>
            <div className="gm-city-name" id="gm-city-name-disp">{q?.name}</div>
            <div className="gm-city-country">{q?.country}</div>
          </div>
          <div style={{fontSize:"0.72rem",color:"var(--muted)",textAlign:"right",maxWidth:140,lineHeight:1.5}}>
            {confirmed ? "🟢 correct  🔴 guess" : "Tap map to drop your pin"}
          </div>
        </div>
        <div id="gm-map-wrap" ref={wrapRef} style={{position:"relative"}}>
          {mapLoading && (
            <div className="gm-map-loading">
              {mapError ? <span>⚠️ Map failed to load</span> : <><div className="gm-map-spinner"/><span>Loading map…</span></>}
            </div>
          )}
          <div className="gm-zoom-controls">
            <button className="gm-zoom-btn" onClick={() => mapRef.current.svg?.transition().duration(300).call(mapRef.current.zoom?.scaleBy, 2)}>+</button>
            <button className="gm-zoom-btn" onClick={() => mapRef.current.svg?.transition().duration(300).call(mapRef.current.zoom?.scaleBy, 0.5)}>−</button>
            <button className="gm-zoom-btn" onClick={resetZoom} title="Reset">⌂</button>
          </div>
        </div>
        <div className="gm-confirm-bar" id="gm-confirm-bar">
          <span className="gm-confirm-label">Happy with your pin? <strong>Confirm</strong> to lock it in.</span>
          <button className="gm-cbtn cancel" onClick={cancelPin}>✕</button>
          <button className="gm-cbtn go" onClick={confirmPin}>✓ Confirm</button>
        </div>
        <div className="gm-city-result-bar">
          <div className={`gm-city-result-text ${resultText.type}`}>{resultText.text || (confirmed ? "" : "Drop your pin on the map")}</div>
          <button className={`gm-next-btn${nextVisible?" visible":""}`} id="gm-next-btn" onClick={nextQuestion}>Next →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   LEADERBOARD SUBMIT COMPONENT
════════════════════════════════════════ */
function LbSubmit({ game, score, detail }) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const submit = () => {
    if (!name.trim()) { setError(true); return; }
    try {
      const key = `lb_${game}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({ name: name.trim(), score, detail, date: Date.now() });
      existing.sort((a, b) => b.score - a.score);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
      setSubmitted(true);
    } catch { alert("Could not submit score."); }
  };

  if (submitted) return <div className="gm-lb-submit" style={{textAlign:"center",color:"var(--green)",fontWeight:700,fontSize:"0.9rem"}}>🎉 Score submitted!</div>;

  return (
    <div className="gm-lb-submit">
      <div className="gm-lb-submit-title">Submit to Leaderboard</div>
      <input
        className="gm-lb-input"
        style={error ? {borderColor:"var(--red)"} : {}}
        placeholder="Your name or initials"
        maxLength={16}
        value={name}
        onChange={e => { setName(e.target.value); setError(false); }}
      />
      <button className="gm-btn" style={{width:"100%",margin:0}} onClick={submit}>Submit Score</button>
    </div>
  );
}

/* ════════════════════════════════════════
   LEADERBOARD PAGE
════════════════════════════════════════ */
function Leaderboard() {
  const [tab, setTab] = useState("flags");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLb = (t) => {
    setLoading(true);
    try {
      const data = JSON.parse(localStorage.getItem(`lb_${t}`) || "[]");
      setEntries(data.slice(0, 10));
    } catch { setEntries([]); }
    setLoading(false);
  };

  useEffect(() => { loadLb(tab); }, [tab]);
  useEffect(() => { loadLb(tab); }, []); // reload fresh on every mount

  const medalClass = i => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  const medalLabel = i => ["🥇","🥈","🥉"][i] || (i + 1);

  return (
    <div className="gm-screen active">
      <div className="gm-screen-icon">🏆</div>
      <div className="gm-screen-title">Leaderboard</div>
      <div className="gm-pill-group" style={{marginBottom:20}}>
        <button className={`gm-pill${tab==="flags"?" selected":""}`} onClick={()=>setTab("flags")}>🏴‍☠️ Flags</button>
        <button className={`gm-pill${tab==="cities"?" selected":""}`} onClick={()=>setTab("cities")}>📍 Cities</button>
      </div>
      <div style={{width:"100%",maxWidth:480}}>
        {loading ? <div className="gm-lb-empty">Loading...</div> :
         entries.length === 0 ? <div className="gm-lb-empty">No scores yet — be the first!</div> :
         entries.map((e, i) => (
           <div className="gm-lb-row" key={i}>
             <div className={`gm-lb-rank ${medalClass(i)}`}>{medalLabel(i)}</div>
             <div style={{flex:1}}>
               <div className="gm-lb-name">{e.name}</div>
               <div className="gm-lb-meta">{e.detail} · {new Date(e.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
             </div>
             <div className="gm-lb-score">{e.score.toLocaleString()}</div>
           </div>
         ))
        }
      </div>
      <p style={{fontSize:"0.72rem",color:"var(--muted)",textAlign:"center",marginTop:16}}>Scores shared publicly</p>
    </div>
  );
}

/* ════════════════════════════════════════
   ROOT APP
════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState("flags");
  const [gameKey, setGameKey] = useState(0);

  const goHome = (t) => {
    setGameKey(k => k + 1); // force remount = full reset
    if (t) setTab(t);
  };

  return (
    <div className="gm-root">
      <header className="gm-header">
        <div className="gm-brand" onClick={() => goHome()}>🌍 <span>GEO</span> MASTER</div>
      </header>

      <div className={`gm-page${tab === "flags" ? " active" : ""}`}>
        {tab === "flags" && <FlagGame key={`flags-${gameKey}`} />}
      </div>
      <div className={`gm-page${tab === "cities" ? " active" : ""}`}>
        {tab === "cities" && <CityGame key={`cities-${gameKey}`} />}
      </div>
      <div className={`gm-page${tab === "leaderboard" ? " active" : ""}`}>
        {tab === "leaderboard" && <Leaderboard />}
      </div>

      <nav className="gm-bnav">
        <div className="gm-bnav-inner">
        {[
          ["flags","🏴‍☠️","Flags"],
          ["cities","📍","Cities"],
          ["leaderboard","🏆","Scores"]
        ].map(([t,icon,label])=>(
          <button
            key={t}
            className={`gm-bnav-btn${tab===t?" active":""}`}
            onClick={() => goHome(t)}
          >
            <span className="gm-bnav-icon">{icon}</span>
            {label}
          </button>
        ))}
        </div>
      </nav>
    </div>
  );
}