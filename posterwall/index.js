const fetchPosters = async () => {
  const res = await fetch("posters.json");
  const posters = await res.json();
  return posters;
}

const goToRoom = (roomName) => {
  location.href = `https://meet.jit.si/NetNeurosci2021_${roomName}`;
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
    svg += `<g transform="translate(${p.x},${p.y-13}) scale(0.2)">
    <path d="M 31.848061,7.6290677 A 28.403238,22.039304 0 0 0 3.596657,29.668006 28.403238,22.039304 0 0 0 10.583386,44.14469 L 7.6648251,56.370967 20.270838,49.740068 A 28.403238,22.039304 0 0 0 32,51.707502 28.403238,22.039304 0 0 0 60.403343,29.668006 28.403238,22.039304 0 0 0 32,7.6290677 a 28.403238,22.039304 0 0 0 -0.151939,0 z"
    fill="rgba(255,255,255,0.4)" onclick="goToRoom('${p.pid}');" style="cursor:pointer; pointer-events: visiblePainted"></path>
    <path d="m 16.837732,20.440612 v 19.377113 h 24.589197 v -8.876977 l 3.412712,1.970421 5.397084,3.11609 v -6.232178 -6.232178 l -5.397084,3.116088 -3.412712,1.970423 v -8.208802 z"
    fill="white" stroke-width="5" onclick="goToRoom('${p.pid}');" style="cursor:pointer; pointer-events: visiblePainted"></path>
    </g>
    `;
    // svg += `<text x="${p.x+5}" y="${p.y+10}">${i} ${p.pid}</text>`
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
}

main();

