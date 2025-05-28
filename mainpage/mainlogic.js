// Hosting a local server, so we get no CORS issues with local files, stands here because I always forget it
// python3 -m  http.server

//Importing the main elements from the HTML
const container = document.getElementById("projects");
const modal = document.getElementById("project-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const backButton = document.querySelector(".back-button");
const bossModal = document.getElementById("boss-modal");

// Boss Monster Data, could be moved to a separate file later
const bossMonster = [
  {
    id: "boss1",
    name: "Boss Monster 1",
    lvl: 1,
    speed: 1200,
    scale: 1,
    /*width and height is in the css TODO lookup how to fix this*/
    hp: 100,
    teleport: false,
    time: false,
  },
  {
    id: "boss2",
    name: "Boss Monster 2",
    lvl: 2,
    speed: 1000,
    width: 150,
    height: 150,
    hp: 300,
    teleport: false,
    time: false,
  },
  {
    id: "boss3",
    name: "Boss Monster 3",
    lvl: 3,
    speed: 800,
    width: 150,
    height: 150,
    hp: 200,
    teleport: false,
    time: false,
  },
  {
    id: "boss4",
    name: "Boss Monster 4",
    lvl: 4,
    speed: 800,
    width: 150,
    height: 150,
    hp: 200,
    teleport: true,
    time: true,
    timer: 30,
  },
  {
    id: "boss5",
    name: "Boss Monster 5",
    lvl: 5,
    speed: 600,
    width: 150,
    height: 150,
    hp: 50,
    teleport: true,
    time: true,
    timer: 60,
  },
  {
    id: "boss6",
    name: "Boss Monster 6",
    lvl: 6,
    speed: 100,
    width: 150,
    height: 150,
    hp: 600,
    teleport: true,
    time: true,
    timer: 90,
  },
  {
    id: "boss7",
    name: "Boss Monster 7",
    lvl: 7,
    speed: 800,
    width: 150,
    height: 150,
    hp: 1000,
    teleport: true,
    time: true,
    timer: 60,
  },
];

// User Data, could be moved to a separate file later
// This is a simple object to store user data, you can expand it later
// For now, it just holds unlocked projects
// Gives us the ability to save and load user progress, even if the user closes the browser
let userData = {
  unlockedProjects: [],
  coins: 0,
  xp: 0,
  defeatedBosses: [],
};

// Boss Fight Variables
// These variables are used to track the current boss fight state
// Get loaded from the bossMonster array
let bossHP = 0;
let bossMaxHP = 0;
let currentBoss = null;
let bossMoveInterval = null;

let bossTimerInterval = null;
let bossTimerSeconds = 0;

// Variable which later fetches the data from the projects.json file
let fallbackBlogPosts = []; // used as the "main" dataset everywhere

// Load the dada from the projects.json file
fetch("../data/projects.json")
  .then((response) => {
    if (!response.ok) throw new Error("Fetch failed");
    return response.json();
  })
  .then((data) => {
    fallbackBlogPosts = data; // overwrite fallback with real data
    userData.unlockedProjects = loadUnlocked(); // Load unlocked projects from localStorage
    renderShip(); // Render the ship icon in the about section
    renderIslands(fallbackBlogPosts); // Render the islands with the fetched data
  })
  .catch((error) => {
    console.warn("Fetch failed, using internal data.", error);
    renderIslands(fallbackBlogPosts); // fallbackBlogPosts is empty unless you populate it manually. TODO:
  });

// Render the islands based from the data, so we can actually see them.
function renderIslands(blogPosts) {
  container.innerHTML = ""; // clear existing islands before rendering
  document.body.style.overflow = ""; // Restore scrolling
  //Go through each blog post and create an island for it
  blogPosts.forEach((post) => {
    const stack = document.createElement("div");
    stack.className = "island-stack";

    const content = document.createElement("div");
    content.className = "island-content";
    content.innerHTML = `<h3>${post.title}</h3><p>${post.summary}</p>`;
    content.style.cursor = "pointer";

    const cliff = document.createElement("div");
    cliff.className = "island-cliff";

    // Check unlock status
    const isUnlocked = userData.unlockedProjects.includes(post.id);

    // If not unlocked, add locked styles and elements
    if (!isUnlocked) {
      content.classList.add("locked");
      cliff.classList.add("locked");
      stack.classList.add("locked");
      // Add lock icon and label
      const lockOverlay = document.createElement("div");
      lockOverlay.className = "lock-overlay";

      /* Lock gets no alt tag, because the text under the lock shows everytime and tells the user if its locked or not*/
      lockOverlay.innerHTML = `
        <img src="../images/lock.png" alt=" " class="lock-icon">
        <p class="locked-label">Locked</p>
      `;
      stack.appendChild(lockOverlay);
    }

    // Set click handler depending on unlock state
    content.onclick = () => {
      if (isUnlocked) {
        openModal(post.title, post.details, post.technologies, post.pictures);
      } else {
        startBossFight(post);
      }
    };

    stack.appendChild(content);
    stack.appendChild(cliff);
    container.appendChild(stack);
  });
}
// Open the modal with the project details, technologies and pictures
// This function is called when the user clicks on an island
function openModal(title, description, technologies = [], pictures = []) {
  modalTitle.textContent = title;
  modalDescription.textContent = description;

  document.body.style.overflow = "hidden"; // Disable scrolling on background

  // Render technologies
  const techContainer = document.getElementById("modal-tech");
  techContainer.innerHTML = ""; // Clear existing technologies
  technologies.forEach((tech) => {
    const tag = document.createElement("span"); // Create a span for each technology
    tag.textContent = tech;
    techContainer.appendChild(tag);
  });

  // Render pictures (images + videos)
  const gallery = document.getElementById("modal-gallery");
  gallery.innerHTML = ""; // Clear existing gallery content



pictures.forEach((media) => {
  const src = media.src;
  const alt = media.alt || title;
  const isVideo = media.type === "video" || src.endsWith(".mp4");
  let element;

  if (isVideo) {
    element = document.createElement("video");
    element.src = src;
    element.controls = true;
    element.classList.add("modal-media");
  } else {
    element = document.createElement("img");
    element.src = src;
    element.alt = alt;
    element.classList.add("modal-media");

    element.addEventListener("click", () => {
      const lightbox = document.getElementById("lightbox");
      const lightboxImg = document.getElementById("lightbox-img");
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.remove("hidden");
    });
  }

  // Add the element to the gallery
  gallery.appendChild(element);
});



  modal.classList.remove("hidden");
  backButton.style.display = "flex";

  // Add zoom behavior to images
  gallery.querySelectorAll("img").forEach((img) => {
    img.addEventListener("click", () => {
      const lightbox = document.getElementById("lightbox");
      const lightboxImg = document.getElementById("lightbox-img");
      lightboxImg.src = img.src;
      lightbox.classList.remove("hidden");
    });
  });

  // Close lightbox on click
  document.getElementById("lightbox").addEventListener("click", () => {
    document.getElementById("lightbox").classList.add("hidden");
  });
}

/* TODO: This Method is no longer used because it looked ugly, but will maybe be later transformed into addRandomObjects, so i keep it in the Code */
function addRandomScratches(containerSelector, count = 10) {
  const container = document.querySelector(containerSelector);
  const maxX = container.clientWidth - 5; // 5px wide
  const maxY = container.clientHeight - 1;

  for (let i = 0; i < count; i++) {
    const scratch = document.createElement("div");
    scratch.className = "scratch-line";

    scratch.style.left = `${Math.floor(Math.random() * maxX)}px`;
    scratch.style.top = `${Math.floor(Math.random() * maxY)}px`;

    container.appendChild(scratch);
  }
}

// Close modal function, which is used to close the modal when the user clicks on the back button or outside of the modal
function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = ""; // Restore scrolling
  backButton.style.display = "none";
}
// Close modal when clicking outside of it
modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});
// Close modal when pressing the escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Toggle the side menu when the user clicks on the menu button
function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  menu.classList.toggle("open");
}
// Add event listener to the menu toggle button
document.addEventListener("click", function (event) {
  const menu = document.getElementById("sideMenu");
  const toggleButton = document.querySelector(".menu-toggle");

  const clickedOutside =
    !menu.contains(event.target) && !toggleButton.contains(event.target);

  if (menu.classList.contains("open") && clickedOutside) {
    menu.classList.remove("open");
  }
});

// Only show back button when modal is active closes the right modal
backButton.addEventListener("click", function (e) {
  e.preventDefault();

  const aboutModal = document.getElementById("about-modal");
  //Check which modal is currently open and close it
  if (!modal.classList.contains("hidden")) {
    closeModal();
  } else if (!bossModal.classList.contains("hidden")) {
    closeBossModal();
  } else if (!aboutModal.classList.contains("hidden")) {
    aboutModal.classList.add("hidden");
    backButton.style.display = "none";
    document.body.style.overflow = ""; // Restore scrolling
  }
});

// Hide back button by default on main page
window.addEventListener("DOMContentLoaded", () => {
  backButton.style.display = "none";
});

// Start the boss fight when the user clicks on a locked island
//!!! This is a pre Method, which later calles the beginBossFight method - Why: because we want to show an intro screen before the fight starts
// Initializes the the html elements and variables for the boss fight
function startBossFight(project) {
  // search the bossMonster array for the boss with the same level as the project
  const boss = bossMonster.find((b) => b.lvl === project.level);
  if (!boss) {
    console.warn("No boss found for this level.");
    return;
  }
  // Set the current boss and its HP
  currentBoss = project;
  bossHP = boss.hp;
  bossMaxHP = boss.hp;

  document.body.style.overflow = "hidden"; // Disable scrolling on background

  //!! Not used anymore, but maybe later we will use it again
  const intro = document.getElementById("boss-intro");
  const introDetails = document.getElementById("boss-intro-details");

  const time = boss.time && boss.timer ? `${boss.timer}s` : "None";
  const abilities = boss.teleport || boss.time ? [] : ["None"];
  if (boss.teleport) abilities.push("Teleport");
  if (boss.time) abilities.push("Time Limit");
  introDetails.innerHTML = `
    Level: ${boss.lvl}<br>
    HP: ${boss.hp}<br>
    Time Limit: ${time}<br>
    Abilities: ${abilities.join(", ")}
  `;

  //TODO No intro because the text is not getting white and i legit dont get why
  /*  
// Show intro
intro.classList.remove("hidden");
intro.classList.add("visible");


setTimeout(() => {
  intro.classList.remove("visible");
  intro.classList.add("hidden");
  beginBossFight(boss);
}, 2800);

*/

  intro.classList.remove("hidden"); // only show it now

  // Popup with boss name :ex: "Level 2"
  showPopup(`Level ${boss.lvl}`, 1500); // Show popup with boss name

  // Start the boss fight after the intro
  // Time is 10mm seconds, longer than the popup so it feels a bit smoother
  setTimeout(() => {
    beginBossFight(boss);
  }, 1510);
}

// Begin the boss fight, this is called in the startBossFight function after the intro

function beginBossFight(boss) {
  // Get the boss monster element
  const monster = document.getElementById("boss-monster");

  // If the monster image (chest.png) cannot load, we just backup with no image - will be brown box
  const img = new Image();
  img.src = "../images/chest.png";
  img.onerror = () => monster.classList.add("no-image");

  // Comment out the width and height, because we now use css to set the size of the boss monster, but keep it here for reference and future use
  //monster.style.width = `${boss.width}px`;
  //monster.style.height = `${boss.height}px`;

  //boss scale is now set in css + json and uses the screen size to adjust at the start of the game
  monster.style.setProperty("--boss-scale", boss.scale || 1);

  // Set the health text
  document.getElementById(
    "boss-health-text"
  ).textContent = `${bossHP} / ${bossMaxHP}`;

  // Set the health bar
  const bar = document.getElementById("boss-health-fill");
  bar.style.width = `100%`;
  bar.style.background = "linear-gradient(to right, #4CAF50, #2E7D32)"; // green by default

  // Set the boss timer if applicable
  const timerText = document.getElementById("boss-timer-text");
  timerText.classList.add("hidden");
  clearInterval(bossTimerInterval); // Clear any existing timer interval

  // Check the timer and set an interval if applicable
  if (boss.time && boss.timer) {
    bossTimerSeconds = boss.timer;
    timerText.textContent = `Time left: ${bossTimerSeconds}s`;
    timerText.classList.remove("hidden");

    bossTimerInterval = setInterval(() => {
      bossTimerSeconds--;
      timerText.textContent = `Time left: ${bossTimerSeconds}s`;

      // If timer is over, end the fight
      if (bossTimerSeconds <= 0) {
        clearInterval(bossTimerInterval);
        showPopup("You ran out of time!");
        setTimeout(() => {
          closeBossModal();
        }, 2000);
      }
    }, 1000);
  }

  // Set the interval for the boss movement and call the moveBoss function
  document.getElementById("boss-modal").classList.remove("hidden");
  bossMoveInterval = setInterval(moveBoss, boss.speed);
  moveBoss();
  backButton.style.display = "flex";
}

// Function which handels the boss click event
function handleBossClick() {
  const damage = Math.floor(Math.random() * 16) + 15; // Random damage between 15 and 30
  bossHP -= damage; // Subtract damage from boss HP
  bossHP = Math.max(0, bossHP); // Ensure boss HP doesn't go below 0

  document.getElementById(
    "boss-health-text"
  ).textContent = `${bossHP} / ${bossMaxHP}`; // Update the health text
  document.getElementById("boss-health-fill").style.width = `${
    (bossHP / bossMaxHP) * 100 
  }%`;

  // Bar
  const fill = document.getElementById("boss-health-fill");
  const percent = (bossHP / bossMaxHP) * 100; 
  fill.style.width = `${percent}%`; // update the health bar 
  //TODO: We actually do the health bar fill some lines above, but we just keep it here for now

  // Colors based on HP percentage
  if (percent > 60) {
    fill.style.background = "linear-gradient(to right, #4CAF50, #2E7D32)"; // grün
  } else if (percent > 30) {
    fill.style.background = "linear-gradient(to right, #FFC107, #FFA000)"; // gelb
  } else {
    fill.style.background = "linear-gradient(to right, #F44336, #B71C1C)"; // rot
  }

  // If Boss is defeated
  if (bossHP <= 0) {
    console.log("Boss defeated:", currentBoss.id);
    showPopup("You defeated the boss!", 1500); // Cool Popup

    if (currentBoss) {
      //unlock in safestate
      currentBoss.locked = false; // unlock the project
      saveUnlocks(); // save the unlocks to localStorage

      container.innerHTML = ""; // Clear the container
      /* renderIslands(fallbackBlogPosts); */
      // or your current list
    }
    setTimeout(() => {
      unlockProject(currentBoss.id); // Unlock the project
      closeBossModal(); // Close the boss modal
    }, 1500); // Wait for popup to show
    console.log("Unlocking:", currentBoss.id);
  } else {
    spawnCoin(); // TODO: maybe add a rnd later for 1-3 coins
  }
}

document
  .getElementById("boss-monster")
  .addEventListener("click", handleBossClick); // Add click event listener to the boss monster for clicking it

// Function to close the boss modal
function closeBossModal() {
  document.getElementById("boss-modal").classList.add("hidden");
  document.body.style.overflow = ""; // Restore scrolling
  // Clear everything related to the boss fight
  clearInterval(bossMoveInterval); 
  clearInterval(bossTimerInterval);
  bossMoveInterval = null;
  bossTimerInterval = null;
  backButton.style.display = "none";
}

/* let bossMoveInterval = null; */

// Move boss function, calculates a random position within the container and moves the boss monster there
function moveBoss() {
  const monster = document.getElementById("boss-monster");
  const container = monster.parentElement;

  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;

  const maxX = containerWidth - monster.offsetWidth;
  const maxY = containerHeight - monster.offsetHeight;

  const newX = Math.floor(Math.random() * maxX);
  const newY = Math.floor(Math.random() * maxY);

  monster.style.left = `${newX}px`;
  monster.style.top = `${newY}px`;
}

// Spawn a coin at a random position within the boss monster area
function spawnCoin() {
  const container = document.querySelector(".boss-content"); // neuer Container
  const monster = document.getElementById("boss-monster");

  const coin = document.createElement("div");
  coin.className = "coin";

  // Position relative to the chest/boss
  const offsetX = Math.random() * (monster.offsetWidth - 24);
  const offsetY = Math.random() * (monster.offsetHeight - 24);

  // TODO: Not used - maybe later for a cool animation
  const monsterRect = monster.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const relativeX = monster.offsetLeft + offsetX;
  const relativeY = monster.offsetTop + offsetY;

  coin.style.left = `${relativeX}px`;
  coin.style.top = `${relativeY}px`;

  container.appendChild(coin); // add coin to the container

  // remove the coin after a short delay
  setTimeout(() => {
    container.removeChild(coin);
  }, 600);
}

// Check if a project is unlocked
function isUnlocked(projectId) {
  return userData.unlockedProjects.includes(projectId);
}

// Unlock a project and save the state
function unlockProject(projectId) {
  if (!userData.unlockedProjects.includes(projectId)) {
    userData.unlockedProjects.push(projectId);
    saveUnlocks(); // Save the unlocks to localStorage
  }

  renderIslands(fallbackBlogPosts); // Re-render the islands to reflect the changes 
}

// Add event listeners for unlock all and lock all buttons
document.getElementById("unlock-all").addEventListener("click", () => {
  console.log("Unlocking all...");
  userData.unlockedProjects = fallbackBlogPosts.map((post) => post.id);
  saveUnlocks(); 
  renderIslands(fallbackBlogPosts);
});
document.getElementById("lock-all").addEventListener("click", () => {
  console.log("Locking all...");
  userData.unlockedProjects = [];
  saveUnlocks();
  renderIslands(fallbackBlogPosts);
});

// Save the unlocked projects to localStorage
function saveUnlocks() {
  localStorage.setItem(
    "unlockedIslands",
    JSON.stringify(userData.unlockedProjects)
  );
}
// Load the unlocked projects from localStorage
function loadUnlocked() {
  return JSON.parse(localStorage.getItem("unlockedIslands")) || [];
}

// Render the ship icon for the about section
function renderShip() {
  const ship = document.createElement("div");
  ship.className = "about-ship";
  /* The Alt Tag is empty because we generate Text under it, which is there without or with the Ship.png, so we dont need extra Text*/
  ship.innerHTML = `
    <img src="../images/ship.png" alt=" " class="ship-icon"> 
    <p class="ship-label">About Me</p>
  `;
  // Add click event to open the about modal
  ship.onclick = () => openAboutModal();
  // Insert the ship at the top of the main content , maybe other ways a smarter but if it works it workss
  const main = document.querySelector("main");
  main.insertBefore(ship, main.firstChild);
}

// Open the about modal when the ship icon is clicked
function openAboutModal() {
  document.getElementById("about-modal").classList.remove("hidden");
  backButton.style.display = "flex";
  document.body.style.overflow = "hidden"; // Disable scrolling on background
}

// Close the about modal when the back button is clicked
//TODO: Same name as the closeModal function, but this one is only for the about modal
function closeModal() {
  modal.classList.add("hidden");
  document.getElementById("about-modal").classList.add("hidden");
  backButton.style.display = "none";
  document.body.style.overflow = ""; // Restore scrolling
}
// Close modal when clicking outside of it
document
  .getElementById("about-modal")
  .addEventListener("click", function (event) {
    if (event.target === document.getElementById("about-modal")) {
      closeModal();
    }
  });
// Close modal when pressing the escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Show a popup message for the user
// duration is now standart 2000ms, but can be changed when calling the function
function showPopup(message, duration = 2000) {
  const popup = document.getElementById("global-popup");
  const text = document.getElementById("popup-text");

  text.textContent = message;
  popup.classList.add("show");
  popup.classList.remove("hidden");

  // Remove the popup after the specified duration
  setTimeout(() => {
    popup.classList.remove("show");
    popup.classList.add("hidden");
  }, duration);
}


/*
------------EVERYTHING BELOW IS MY LITTLE CODE GRAVEYARD, WHERE I PUT THINGS I MIGHT NEED LATER OR JUST DONT KNOW WHAT TO DO WITH THEM YET OR IM JUST TO SCARED TO DELETE THEM COMPLETLY, SO PLEASE IGNORE----------------
*/


/* TODO Schoud prevent double tap zoom on mobile devices
document.addEventListener('touchstart', function preventDoubleTapZoom(e) {
  if (e.touches.length > 1) {
    e.preventDefault(); // mehrere Finger → blockieren
  }
}, { passive: false });
*/

//Trash just ignore it (its here because im scared that i deleted anything important)

/*
document.getElementById("boss-monster").addEventListener("click", () => {
  const damage = Math.floor(Math.random() * 16) + 15;
  bossHP -= damage;
  bossHP = Math.max(0, bossHP);
/*
  // Text
  /* document.getElementById("boss-health").textContent = `Boss HP: ${bossHP}`;*/
//document.getElementById("boss-health-text").textContent = `${bossHP} / ${bossMaxHP}`;

/*
  // Bar
  const fill = document.getElementById("boss-health-fill");
  const percent = (bossHP / bossMaxHP) * 100; // falls du später dynamische MaxHP willst: nutze bossMaxHP
  fill.style.width = `${percent}%`;
  // Colors based on HP percentage
  if (percent > 60) {
    fill.style.background = "linear-gradient(to right, #4CAF50, #2E7D32)"; // grün
  } else if (percent > 30) {
    fill.style.background = "linear-gradient(to right, #FFC107, #FFA000)"; // gelb
  } else {
    fill.style.background = "linear-gradient(to right, #F44336, #B71C1C)"; // rot
  }
/*TODO I MAKE SOME REALLY UNNECESSARY THINGS HERE   TODO: Or do I ?*/
/*
  if (bossHP <= 0) { 
    setTimeout(() => {
      alert("You defeated the boss!");
      closeBossModal();
    }, 50);
  } else {
    spawnCoin();
  }
    });

    / Test Buttons for Boss Levels
for (let lvl = 1; lvl <= 4; lvl++) {
  const button = document.createElement("button");
  button.textContent = `Test Boss Level ${lvl}`;
  button.style.margin = "5px";
  button.onclick = () => {
    const dummyProject = {
      id: `test-${lvl}`,
      level: lvl,
      title: `Test Boss ${lvl}`,
    };
    startBossFight(dummyProject);
  };
  document.body.appendChild(button);
}
    */
