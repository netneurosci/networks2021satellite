let posters;
async function getPosters() {
  let res = await fetch("posters.json");
  const data = await res.json();

  // res = await fetch("posters-overrides.json");
  // const override = await res.json();
  // override.posters.forEach(o => {
  //     let p = data.posters.find(p=>p.number === o.number);
  //     const {videochat, pdf} = o;
  //     if(videochat) {
  //       p.videochat = `<a href=\"https://meet.jit.si/${videochat}\" target=\"_${videochat}\">${videochat}</a>`;
  //     }
  //     if(pdf) {
  //       p.pdf = o.pdf;
  //     }
  // });
  return data.posters;
}

function displayPosters(el) {
  let str = ""
  for(p of posters) {
    str += `<div class="dot" id="${p.number}" title="[${p.number}] ${p.title}"></div>`;
  }
  el.innerHTML = str;
}

function displayPoster(p) {
  const el = document.getElementById("poster");
  const dot = document.getElementById(p.number);
  const {connected} = dot.dataset;
  const roomName = p.videochat.match(/>([^<]+)</)[1].replace("jitsi:","");
  const roomLink = `<a href="#" onclick="openJit('${p.number}', '${roomName}')"><i class="fas fa-video"></i></a>`;
  const videoLink = 
  el.innerHTML = `
<div class="small">Poster #${p.number} [${connected|0} connected]</div>
<div class="title">${p.title}</div>
<div class="medium">${p.authors.join(", ")}</div>
<div class="pdf"><a href="${p.pdf}"><i class="far fa-file-pdf"></i></a></div>
<div class="video">${roomLink}</div>
`;
  el.style.display="inline-block";
}

function resize() {
  const room = document.getElementById("room");
  const H = room.clientHeight;
  const W = room.clientWidth;
  let S = Math.floor(((Math.sqrt(W*H/posters.length))-2.7));
  document.styleSheets[0].cssRules[0].style.width=`${S}px`;
  document.styleSheets[0].cssRules[0].style.height=`${S}px`;
}

function closePoster() {
  document.getElementById("poster").style.display="none";
}

function websocketDump(dump) {
  for(key in dump) {
    if(key !== "" &&  {}.hasOwnProperty.call(dump, key)) {
      const el = document.getElementById(`${key}`);
      try {
        el.classList.add("connected");
      } catch (e) {
        console.log(e);
        console.log(`key: [${key}]`, dump);
      }
      el.innerText=dump[key];
      el.dataset.connected = dump[key];
    }
  }
}

function websocketUpdate(update) {
  const {id: key, count} = update;
  const el = document.getElementById(`${key}`);
  if(count === 0) {
    el.classList.remove("connected");
    el.innerText = "";
    delete el.dataset.connected;
  } else {
    el.classList.add("connected");
    el.innerText = count;
    el.dataset.connected = count;
  }
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
  // wss = new WebSocket("wss://dev1.soichi.us/ohbm2020/");
  wss.onopen = () => {
    console.log("send dump");
      wss.send(JSON.stringify({action: "dump"}));
  }
  wss.onmessage = websocketOnMessage;
}

function clickHandler(e) {
  const {id} = e.target;
  console.log(id);

  if(document.getElementById("poster").style.display !== "none") {
    document.getElementById("poster").style.display = "none";
    return;
  }

  const poster = posters.filter((o)=>o.number === parseInt(id));
  if(poster.length) {
    displayPoster(poster[0]);
  }
}

function openJit(id, name) {
  window.open("room.html#"+id+"."+name);
}

async function main() {
posters = await getPosters();
const room = document.querySelector("#room");
displayPosters(room);
document.getElementById("poster").style.display = "none";
document.getElementById("room").addEventListener('click', clickHandler);
window.onresize = resize;
resize();
connectToWebsocket();
}

main();
