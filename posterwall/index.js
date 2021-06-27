const fetchPosters = async () => {
  const res = await fetch("posters.json");
  const posters = await res.json();
  return posters;
}

const displayPosters = async () => {
  const posters = await fetchPosters();
  const z = viewer.viewport.getZoom()/6;
  console.log(z);
  for (const p of posters) {
    p.x = 665 + p.x*z;
    p.y = 566 + p.y*z;
    p.width *= z;
    p.height *= z;
    document.querySelector("#rois").innerHTML += `
    <path d="M${p.x},${p.y}h${p.width}v${p.height}h${-p.width}v${-p.height}" stroke="rgba(255,0,0,0.5)" fill="none"></path>`;
  }
}

// displayPosters();