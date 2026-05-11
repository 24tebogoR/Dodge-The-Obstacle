// Game 11: DODGE OBSTACLES
// 1. ---Creating DOM ELEMENTS ---
// document.querySelector finds an element from given html by its ID 
const playerNameInput = document.querySelector("#playerName");
const difficultySelect = document.querySelector("#difficulty");
const gameLengthSelect = document.querySelector("#gameLength");

// Checkboxes developed to ensures they return a boolean value (true if checked, false if not)
const showShadowCheckbox = document.querySelector("#showShadow");
const enableBonusCheckbox = document.querySelector("#enableBonus");
const doubleScoreCheckbox = document.querySelector("#doubleScore");

// document.querySelector finds an element from given html by its ID
const openGameBtn = document.querySelector("#openGameBtn");
const saveSettingsBtn = document.querySelector("#saveSettingsBtn");
const loadSettingsBtn = document.querySelector("#loadSettingsBtn");
const resetSettingsBtn = document.querySelector("#resetSettingsBtn");
const instructionsBtn = document.querySelector("#instructionsBtn");

// This is where the summary text will be displayed to the user
const previewText = document.querySelector("#previewText");
// querySelectorAll grabs ALL elements that match and returns a list or array
const themeOptions = document.querySelectorAll('input[name="theme"]')
// nb: Loops through the list of radio buttons to find which one is "checked"

// 2. --- Create Functions ---
function getSelectedTheme() {
  let selectedTheme = "car"; // Set a default starting value
  let i = 0;

  for (i = 0; i < themeOptions.length; i++) {
    if (themeOptions[i].checked) {
      // If this radio button is selected, store its value (space or car)
      selectedTheme = themeOptions[i].value;
    }
  }

  return selectedTheme;
}

// Createting an Object containing all the current user values
 
function getSettings() {
  const settings = {
    playerName: playerNameInput.value.trim(), // .trim() removes will remove spaces at start/end
    difficulty: difficultySelect.value,
    gameLength: gameLengthSelect.value,
    theme: getSelectedTheme(),
    showShadow: showShadowCheckbox.checked, // Stores true or false
    enableBonus: enableBonusCheckbox.checked,
    doubleScore: doubleScoreCheckbox.checked
  };

  return settings;
}

// creating a readable string for the "Options" section of the preview

function getOptionsText(settings) {
  let optionsText = "";

  // addcstrings together based on which checkboxes are true
  if (settings.showShadow) {
    optionsText = optionsText + "Shadow, ";
  }

  if (settings.enableBonus) {
    optionsText = optionsText + "Bonus items, ";
  }

  if (settings.doubleScore) {
    optionsText = optionsText + "Double score, ";
  }

  // If no boxes were checked, it will return "none"
  if (optionsText === "") {
    return "None";
  }

  // NB: the slice(0, length - 2) will removes the very last comma and space for a clean look and mantain functionality
  return optionsText.slice(0, optionsText.length - 2);
}

// below updates the HTML inside the preview div to show the user their current choices
 
function updatePreview() {
  const settings = getSettings();
  let playerName = settings.playerName;

  if (playerName === "") {
    playerName = "Not entered";
  }

  // innerHTML allows us to insert actual HTML tags like "<br>" for line breaks, helps maintain clean look
  previewText.innerHTML =
    "Player: " + playerName + "<br>" +
    "Difficulty: " + settings.difficulty + "<br>" +
    "Game Length: " + settings.gameLength + " seconds<br>" +
    "Theme: " + settings.theme + "<br>" +
    "Options: " + getOptionsText(settings);
}

// Creating Cookiess to tores the player name in the browser's long-term memory
 
function setCookie() {
  let playerName = playerNameInput.value.trim();
  // NB: path=/ ensures this cookie available on all pages of website
  document.cookie = "playerName=" + playerName + ";path=/";
}

// function below reads the cookie string and extracts the specific value for "playerName"
function getCookie() {
  let cookieText = document.cookie;
  let cookieArray = cookieText.split(";"); // Cookies are stored as one long string separated by semicolons
  let i = 0;

  for (i = 0; i < cookieArray.length; i++) {
    let item = cookieArray[i].trim();

    // this Checks if a specific piece of the cookie string starts with our key
    if (item.indexOf("playerName=") === 0) {
      // Return everything after the equals sign
      return item.substring(11);
    }
  }

  return "";
}

//  this function takes a settings object and inserts those values back into the HTML input elements

function applySettings(settings) {
  let i = 0;

  playerNameInput.value = settings.playerName;
  difficultySelect.value = settings.difficulty;
  gameLengthSelect.value = settings.gameLength;

  showShadowCheckbox.checked = settings.showShadow;
  enableBonusCheckbox.checked = settings.enableBonus;
  doubleScoreCheckbox.checked = settings.doubleScore;

  // Loop through radio buttons to find the one that matches the saved theme name
  for (i = 0; i < themeOptions.length; i++) {
    if (themeOptions[i].value === settings.theme) {
      themeOptions[i].checked = true;
    }
  }

  updatePreview();
}

// this fucntion will save all current settings into Session Storage 

function saveSettings() {
  const settings = getSettings();
  let playerName = settings.playerName;

  // Creating Validation: this ensures that nothhing will save if playerName empty
  if (playerName === "") {
    playerName = prompt("Please enter your player name:");

    if (playerName === null) {
      return; // Stop function if user clicks "Cancel" on the prompt
    }

    playerName = playerName.trim();

    if (playerName === "") {
      alert("Player name is required.");
      return;
    }

    playerNameInput.value = playerName;
    settings.playerName = playerName;
  }

  setCookie(); // Save to cookie for backup

  // creating sessionStorage to ensure it only saves strings, so booleans are converted to text here
  sessionStorage.setItem("playerName", settings.playerName);
  sessionStorage.setItem("difficulty", settings.difficulty);
  sessionStorage.setItem("gameLength", settings.gameLength);
  sessionStorage.setItem("theme", settings.theme);
  sessionStorage.setItem("showShadow", settings.showShadow);
  sessionStorage.setItem("enableBonus", settings.enableBonus);
  sessionStorage.setItem("doubleScore", settings.doubleScore);

  updatePreview();
  alert("Settings saved.");
}

// this fucntion Tries to find saved data in Session Storage first and then checks cookies
function loadSettings() {
  const savedPlayerName = sessionStorage.getItem("playerName");

  // NB: If savedPlayerName is NOT null, it means found something was found in storage
  if (savedPlayerName !== null) {
    const settings = {
      playerName: savedPlayerName,
      difficulty: sessionStorage.getItem("difficulty"),
      gameLength: sessionStorage.getItem("gameLength"),
      theme: sessionStorage.getItem("theme"),
      // NB; the string "true" must be compared to get a real boolean true
      showShadow: sessionStorage.getItem("showShadow") === "true",
      enableBonus: sessionStorage.getItem("enableBonus") === "true",
      doubleScore: sessionStorage.getItem("doubleScore") === "true"
    };

    applySettings(settings);
    alert("Settings loaded.");
    return;
  }

  // NB: If no session storage then try loading just the name from the cookie
  let savedName = getCookie();
  if (savedName !== "") {
    playerNameInput.value = savedName;
    updatePreview();
    alert("Player name loaded from cookie.");
    return;
  }

  updatePreview();
}

// this function  Resets the UI to default values and wipes the Session Storage clean
function resetSettings() {
  // confirm() shows a popup with OK and Cancel
  let answer = confirm("Do you want to reset all settings?");

  if (answer === false) {
    return; // Exit function if user changed their mind
  }

  // Resetting form fields to defaults
  playerNameInput.value = "";
  difficultySelect.value = "Medium";
  gameLengthSelect.value = "30";
  showShadowCheckbox.checked = true;
  enableBonusCheckbox.checked = true;
  doubleScoreCheckbox.checked = false;

  // NB: THIS Reset theme radio buttons to "car"
  for (let i = 0; i < themeOptions.length; i++) {
    if (themeOptions[i].value === "car") {
      themeOptions[i].checked = true;
    }
  }

  // Wipes the session storage clean
  sessionStorage.clear();

  updatePreview();
  alert("Settings reset.");
}

function openGameWindow() {
  // First, make sure we save the current settings so the game can read them
  saveSettings(); 
  
  // Navigate to your game HTML file (make sure the filename matches!)
  window.location.href = "game.html"; 
}

// This function shows a simple popup with the rules
function openGameWindow() {
  // First, make sure we save the current settings so the game can read them
  saveSettings(); 
  
  // Navigate to your game HTML file (make sure the filename matches!)
  window.location.href = "game.html"; 
}

// This function shows a simple popup with the rules
function openInstructions() {
  const instructions = "HOW TO PLAY:\n\n" +
    "1. Use the LEFT and RIGHT arrow keys to move.\n" +
    "2. Avoid the 'X' obstacles (you have 3 lives).\n" +
    "3. Collect the '+' bonuses for extra points.\n" +
    "4. Survive until the timer runs out!";
    
  alert(instructions);
}

//3. --- Creating EVENT LISTENERS ---

// NB: "input" triggers the preview update as soon as the user interacts
playerNameInput.addEventListener("input", updatePreview);
difficultySelect.addEventListener("change", updatePreview);
gameLengthSelect.addEventListener("change", updatePreview);
showShadowCheckbox.addEventListener("change", updatePreview);
enableBonusCheckbox.addEventListener("change", updatePreview);
doubleScoreCheckbox.addEventListener("change", updatePreview);

// NB: since themeOptions is a list of elements, we must create loop to through and add listeners to each
for (let i = 0; i < themeOptions.length; i++) {
  themeOptions[i].addEventListener("change", updatePreview);
}

// Creatign Button click handlers
saveSettingsBtn.addEventListener("click", saveSettings);
loadSettingsBtn.addEventListener("click", loadSettings);
resetSettingsBtn.addEventListener("click", resetSettings);
openGameBtn.addEventListener("click", openGameWindow);
instructionsBtn.addEventListener("click", openInstructions);

// this ensres when the whole page finishes loading it displays the initial preview
window.addEventListener("load", function () {
  updatePreview();
});