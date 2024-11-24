 // VoiceRSS function as given
const VoiceRSS = {
  speech: function(e) {
    this._validate(e);
    this._request(e);
  },
  _validate: function(e) {
    if (!e) throw "The settings are undefined";
    if (!e.key) throw "The API key is undefined";
    if (!e.src) throw "The text is undefined";
    if (!e.hl) throw "The language is undefined";
    if (e.c && "auto" != e.c.toLowerCase()) {
      var a = !1;
      switch (e.c.toLowerCase()) {
        case "mp3":
          a = (new Audio).canPlayType("audio/mpeg").replace("no", "");
          break;
        case "wav":
          a = (new Audio).canPlayType("audio/wav").replace("no", "");
          break;
        case "aac":
          a = (new Audio).canPlayType("audio/aac").replace("no", "");
          break;
        case "ogg":
          a = (new Audio).canPlayType("audio/ogg").replace("no", "");
          break;
        case "caf":
          a = (new Audio).canPlayType("audio/x-caf").replace("no", "");
      }
      if (!a) throw "The browser does not support the audio codec " + e.c;
    }
  },
  _request: function(e) {
    var a = this._buildRequest(e),
        t = this._getXHR();
    t.onreadystatechange = function() {
      if (4 == t.readyState && 200 == t.status) {
        if (0 == t.responseText.indexOf("ERROR")) throw t.responseText;
        audioElement.src = t.responseText;
        audioElement.play();
      }
    };
    t.open("POST", "https://api.voicerss.org/", !0);
    t.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    t.send(a);
  },
  _buildRequest: function(e) {
    var a = e.c && "auto" != e.c.toLowerCase() ? e.c : this._detectCodec();
    return "key=" + (e.key || "") + "&src=" + (e.src || "") + "&hl=" + (e.hl || "") + "&r=" + (e.r || "") + "&c=" + (a || "") + "&f=" + (e.f || "") + "&ssml=" + (e.ssml || "") + "&b64=true";
  },
  _detectCodec: function() {
    var e = new Audio;
    return e.canPlayType("audio/mpeg").replace("no", "") ? "mp3" : e.canPlayType("audio/wav").replace("no", "") ? "wav" : e.canPlayType("audio/aac").replace("no", "") ? "aac" : e.canPlayType("audio/ogg").replace("no", "") ? "ogg" : e.canPlayType("audio/x-caf").replace("no", "") ? "caf" : "";
  },
  _getXHR: function() {
    try { return new XMLHttpRequest } catch (e) {}
    try { return new ActiveXObject("Msxml3.XMLHTTP") } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0") } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0") } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP") } catch (e) {}
    try { return new ActiveXObject("Microsoft.XMLHTTP") } catch (e) {}
    throw "The browser does not support HTTP request";
  }
};

let isPlaying = false;  // To track if the Ayah is currently being played
let currentAyah = null; // Store the current Ayah info for toggling display

// Function to fetch and play a random Ayah
function playRandomAyah() {
  if (isPlaying) {
    // If the audio is already playing, stop it and reset
    document.getElementById('ayahText').style.display = 'none';  // Hide Ayah text
    isPlaying = false;  // Toggle the state
    return;
  }
  
  // Generate a random number between 1 and 6236 for the Ayah
  const randomAyahNumber = Math.floor(Math.random() * 6236) + 1;

  // Fetch the Ayah from the Quran API
  fetch(`http://api.alquran.cloud/v1/ayah/${randomAyahNumber}/en.asad`)
    .then(response => response.json())
    .then(data => {
      if (data.data && data.data.text) {
        const ayahText = data.data.text;
        const surahNumber = data.data.surah.number;
        const ayahNumber = data.data.number;

        // Display the Ayah text with Surah and Ayah numbers on screen
        const displayText = `Surah ${surahNumber}, Ayah ${ayahNumber}:<br>"${ayahText}"`;
        document.getElementById('ayahText').innerHTML = displayText;
        document.getElementById('ayahText').style.display = 'block';  // Show Ayah text

        // Call VoiceRSS to play the Ayah
        VoiceRSS.speech({
          key: 'API-KEY',  // Replace with your VoiceRSS API key
          src: ayahText,
          hl: 'en-us',  // Language is English (US)
          c: 'mp3',     // Audio format (mp3)
        });

        // Set flag as playing
        isPlaying = true;
        currentAyah = {
          text: ayahText,
          surahNumber: surahNumber,
          ayahNumber: ayahNumber
        };
      }
    })
    .catch(error => {
      console.error('Error fetching the Ayah:', error);
    });
}