console.log("page loaded");

const canvas = document.getElementById('gameMap');
const ctx = canvas.getContext('2d');
ctx.strokeStyle = "#ffaaaa";

zoneMap = document.getElementById("kcMap");
let isCircleActive = false;
let circlePosition = {x:0, y:0};
let currentData;

const circleRadius = 50;

function getData() {
  let json = payload1;
  return json;
}

function repaint() {
  //console.log("called repaint");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(zoneMap, 0, 0, 800, 800);

  //handle player positions
  currentData = getData();

  currentData.players.forEach(player => {
    //console.log(player);
    switch(player.status) {
      case "dead":
      ctx.fillStyle = "#aaaaaa";
      break;
      case "downed":
      ctx.fillStyle = "#aa0000";
      break;
      case "rezzing":
      ctx.fillStyle = "#00ff00";
      break;
      default:
      ctx.fillStyle = "#ff4444";
      break;
    }
    if(player.hasFiredRecently) {
      ctx.strokeStyle = "#ffffff";
    } else {
      ctx.strokeStyle = "#222222";
    }
    //ctx.fillRect(0, 0, 150, 75);
    ctx.beginPath();
    ctx.moveTo(player.position[0], player.position[1]+5);
    ctx.lineTo(player.position[0]+5, player.position[1]);
    ctx.lineTo(player.position[0], player.position[1]-5);
    ctx.lineTo(player.position[0]-5, player.position[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });


  if(isCircleActive) {
    //console.log("draw circle");
    ctx.strokeStyle = "#dddddd";
    ctx.beginPath();
    ctx.arc(circlePosition.x, circlePosition.y, circleRadius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  //ctx.fillStyle = "#FF0000";
  //ctx.fillRect(0, 0, 150, 75);
}

let mainLoop = setInterval(repaint, 1000);

canvas.addEventListener("click", clickHandler);
function clickHandler(e) {
  e.preventDefault();
  //set up the location for the drawn circle, figure out who is in it, and then draw that stuff
  // to the sidebar.
  //console.log("click handler");
  //console.log(e);
  circlePosition.x = e.offsetX;
  circlePosition.y = e.offsetY;
  isCircleActive = true;
  //repaint(); //don't want full repaint because of server calls, but we can draw the circle.
  ctx.beginPath();
  ctx.arc(circlePosition.x, circlePosition.y, 50, 0, 2 * Math.PI);
  ctx.stroke();

  trackPlayers();

  return false;
}

const playerDivTemplate = document.getElementsByClassName("player")[0];
const playerDivContainer = document.getElementById("playerHud");

function trackPlayers() {
  //given a click ring, compare against player positions
  // and populate #playerHud
  while (playerDivContainer.firstChild) { //clear old children.
    playerDivContainer.removeChild(playerDivContainer.firstChild);
  }
  let activePlayerList = [];
  currentData.players.forEach(player => {
    //compare player x/y to circlePosition. Throw out any waytoofar
    let xdist = Math.abs(player.position[0] - circlePosition.x);
    let ydist = Math.abs(player.position[1] - circlePosition.y);
    if((xdist > circleRadius+10) || (ydist > circleRadius+10)) {
      return;
    } else {
      //now we do trig to see if it's inside the circle.
      let distance = Math.sqrt(Math.pow(xdist,2)+Math.pow(ydist,2));
      if (distance < circleRadius) {
        activePlayerList.push(player);
        buildPlayerDiv(player);
      }
    }
  });

  //console.log(activePlayerList);
}

function buildPlayerDiv(player) {
  let topDiv = document.createElement("div");
  topDiv.classList.add("player");
  let nameDiv = document.createElement("div");
  nameDiv.classList.add("playerName");
  let nameTxt = document.createTextNode(player.name);
  nameDiv.appendChild(nameTxt);
  topDiv.appendChild(nameDiv);
  let equipDiv = document.createElement("div");
  equipDiv.classList.add("equipment");
  topDiv.appendChild(equipDiv);
  let weaponDiv = document.createElement("div");
  weaponDiv.classList.add("weapons");
  equipDiv.appendChild(weaponDiv);
  let wep1div = document.createElement("div");
  wep1div.classList.add("wep1");
  let wep1Txt = document.createTextNode(player.weapon1);
  wep1div.appendChild(wep1Txt);
  weaponDiv.appendChild(wep1div);
  let wep2div = document.createElement("div");
  wep2div.classList.add("wep2");
  //wep2div.createTextNode(player.weapon2);
  let wep2Txt = document.createTextNode(player.weapon2);
  wep2div.appendChild(wep2Txt);
  weaponDiv.appendChild(wep2div);
  let gearDiv = document.createElement("div");
  gearDiv.classList.add("gear");
  equipDiv.appendChild(gearDiv);
  let armorDiv = document.createElement("div");
  armorDiv.classList.add("armor");
  armorDiv.classList.add("t"+player.armorTier);
  //armorDiv.createTextNode("armor");
  let armorTxt = document.createTextNode("armor");
  armorDiv.appendChild(armorTxt);
  gearDiv.appendChild(armorDiv);
  let helmetDiv = document.createElement("div");
  helmetDiv.classList.add("helmet");
  helmetDiv.classList.add("t"+player.helmetTier);
  //helmetDiv.createTextNode("helmet");
  let helmetTxt = document.createTextNode("helmet");
  helmetDiv.appendChild(helmetTxt);
  gearDiv.appendChild(helmetDiv);
  let backpackDiv = document.createElement("div");
  backpackDiv.classList.add("backpack");
  backpackDiv.classList.add("t"+player.backpackTier);
  //backpackDiv.createTextNode("backpack");
  let backpackTxt = document.createTextNode("backpack");
  backpackDiv.appendChild(backpackTxt);
  gearDiv.appendChild(backpackDiv);
  let kdshieldDiv = document.createElement("div");
  kdshieldDiv.classList.add("kdshield");
  kdshieldDiv.classList.add("t"+player.kdShieldTier);
  //kdshieldDiv.createTextNode("kd shield");
  let kdshieldTxt = document.createTextNode("kd shield");
  kdshieldDiv.appendChild(kdshieldTxt);
  gearDiv.appendChild(kdshieldDiv);

  playerDivContainer.appendChild(topDiv);
}

/**
 *  <div class="player demo">
      <div class="playerName">
        Dummie
      </div>
      <div class="equipment">
        <div class="weapons">
          <div class="wep1">
            P2020
          </div>
          <div class="wep2">
            Mozambique
          </div>
        </div>
        <div class="gear">
          <div class="armor t1">shield</div>
          <div class="helmet t2">helmet</div>
          <div class="backpack t3">backpack</div>
          <div class="kdshield t4">kd shield</div>
        </div>
      </div>
    </div>
 */