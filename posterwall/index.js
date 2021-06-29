const fetchPosters = async () => {
  const res = await fetch("posters.json");
  const posters = await res.json();
  return posters;
}

const goToRoom = (roomName) => {
  location.href = `https://meet.jit.si/NetNeurosci2021_${roomName}`;
}

function openJit(id, name) {
  window.open("room.html#"+id+"."+name);
}

const displayPosters = (posters) => {
  const z = 1; // 0.1;
  const g = 1000/(5221+6313) * 0.915;
  let svg = "";
  let i =0;
  for (const p of posters) {
    i += 1;
    p.x = (p.x + 6313)*g;
    p.y = (p.y + 4826)*g;
    p.width *= g;
    p.height *= g;
    //     d="M${p.x},${p.y}h${p.width}v${p.height}h${-p.width}v${-p.height}"
    // d="M${p.x},${p.y-10}h10v10h-10v-10"
    const [id, name] = p.pid.split("_");
    svg += `<g id="nn21-${id}" transform="translate(${p.x},${p.y-13}) scale(0.2)">
      <path class="bubble" d="M 31.848061,7.6290677 A 28.403238,22.039304 0 0 0 3.596657,29.668006 28.403238,22.039304 0 0 0 10.583386,44.14469 L 7.6648251,56.370967 20.270838,49.740068 A 28.403238,22.039304 0 0 0 32,51.707502 28.403238,22.039304 0 0 0 60.403343,29.668006 28.403238,22.039304 0 0 0 32,7.6290677 a 28.403238,22.039304 0 0 0 -0.151939,0 z"
      fill="rgba(255,255,255,0.4)" onclick="openJit('nn21-${id}', '${name}');" style="cursor:pointer; pointer-events: visiblePainted"></path>
      <path class="video" d="m 16.837732,20.440612 v 19.377113 h 24.589197 v -8.876977 l 3.412712,1.970421 5.397084,3.11609 v -6.232178 -6.232178 l -5.397084,3.116088 -3.412712,1.970423 v -8.208802 z"
      fill="white" stroke-width="5" onclick="openJit('nn21-${id}', '${name}');" style="cursor:pointer; pointer-events: visiblePainted"></path>
      <text font-size="30" x="70" y="40" fill="white"></text>
      <g transform="translate(30,30)"><circle cx="0" cy="0" r="1" stroke-width="0.1" fill="none" stroke="white" /></g>
    </g>
    `;
  }
  document.querySelector("#svg").innerHTML = svg;
}

function updateOverlay() {
  const zoom = viewer.viewport.getZoom({current:true});
  const pan = viewer.viewport.getCenter({current:true});
  const svg = document.querySelector("#svg");
  const display = document.querySelector("#openseadragon1").getBoundingClientRect();
  const wsvg = 1000/zoom;
  const hsvg = 1000/zoom;
  const x = -(wsvg - 1000)/2 + 1000*(pan.x - 0.5);
  const y = -(hsvg*display.height/display.width - 1000)/2 + 1000*(pan.y - 0.5);
  svg.setAttribute('viewBox', `${x} ${y} ${wsvg} ${hsvg}`);
  // document.querySelector("#svg-style").sheet.rules[0].style["transform"] = `scale(${1/zoom})`;
}

const updateVideochatIcon = (sel, count) => {
  const el = document.querySelector(sel);
  if(!el) {
    return;
  }

  if (count === 0) {
    el.querySelector("text").innerHTML = "";
    el.querySelector(".bubble").setAttribute("fill", "rgba(255,255,255,0.4)");
    el.classList.remove("connected");
  } else {
    el.querySelector("text").innerHTML = count;
    el.querySelector(".bubble").setAttribute("fill", "rgb(0, 220, 0)");
    el.classList.add("connected");
  }
}

function websocketDump(dump) {
  for(key in dump) {
    if(key !== "" &&  {}.hasOwnProperty.call(dump, key)) {
      console.log("dump", key, dump[key]);
      updateVideochatIcon(`#${key}`, parseInt(dump[key]));
    }
  }
}

function websocketUpdate(update) {
  const {id: key, count} = update;

  if (key.split("-")[0] !== "nn21") {
    return;
  }

  console.log("update", key, count);
  updateVideochatIcon(`#${key}`, parseInt(count));
}

function websocketOnMessage(e) {
  let msg = JSON.parse(e.data);
  if(msg.dump) {
    websocketDump(msg.dump);
  }
  if(msg.update) {
    websocketUpdate(msg.update);
  }
}

function connectToWebsocket() {
  wss = new ReconnectingWebSocket("wss://brainspell.org/vcrooms");
  wss.onopen = () => {
    console.log("send dump request");
      wss.send(JSON.stringify({action: "dump"}));
  }
  wss.onmessage = websocketOnMessage;
}

let viewer;
const main = async () => {
  viewer = OpenSeadragon({
    maxZoomPixelRatio: 3,
    showNavigator: true,
    navigatorPosition: "ABSOLUTE",
    navigatorTop:      "5px",
    navigatorLeft:     "calc(100% - 300px - 5px)",
    navigatorHeight:   "150px",
    navigatorWidth: "300px",
    navigatorAutoFade:  false,
    id: "openseadragon1",
    showNavigationControl: false,
    tileSources: "https://microdraw.pasteur.fr/netneurosci2021/dzi.js"
  });
  
  viewer.bookmarkUrl();

  const posters = await fetchPosters();
  displayPosters(posters);

  viewer.addHandler('animation', () => {updateOverlay();});
  viewer.addHandler('pan', () => {updateOverlay();});

  connectToWebsocket();
}

main();

