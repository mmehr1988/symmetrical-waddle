'use strict';

// -------------------------------------------------------------
// VARIABLES
// -------------------------------------------------------------

// Page Transition
var btnLanding = document.querySelector('.btnLanding');
var mixerLanding = document.querySelector('.mixerLanding');
var mixerMain = document.querySelector('.mixerMain');

// Mixer Controls
var btnPlay = document.querySelectorAll('.btnPlay');
var btnPause = document.querySelectorAll('.btnPause');
var btnStop = document.querySelectorAll('.btnStop');
var btnMute = document.querySelectorAll('.btnMute');
var btnUnMute = document.querySelectorAll('.btnUnMute');
var btnShuffle = document.querySelectorAll('.btnShuffle');
var speedLabel = document.querySelectorAll('label input');

// Local Storage Random Playlist
var localVideos = JSON.parse(localStorage.getItem('videoid'));
var iframeCount = 4;

// -------------------------------------------------------------
// CLICK EVENT TO SWITCH BETWEEN LANDING AND CONTROLLER PAGE
// -------------------------------------------------------------

btnLanding.addEventListener('click', function () {
  mixerLanding.classList.add('hidden');
  mixerMain.classList.remove('hidden');
});

// -------------------------------------------------------------
// VARIABLES: SEARCH YOUTUBE
// -------------------------------------------------------------

var btnGetRandom = document.getElementById('btnSearch');

// -------------------------------------------------------------
// API KEYS:
// -------------------------------------------------------------
var youtubeAPIKey = 'AIzaSyAXATbNsYeAbsZ0H9cj4GP7h0rGaEufiqU';

// // Allie; ERROR 403
// var youtubeAPIKey = 'AIzaSyAOhTN-z_jfKMROH447wGEiZF-l62N78mQ';

var wordsAPIKey = '47de2ec1bfmsh3e9119d6a18e315p16d88ejsn8fb3d33e52c8';

// -------------------------------------------------------------
// WORDS API + YOUTUBE API V3
// -------------------------------------------------------------

// // Click event to run loop for word retrieval
btnGetRandom.addEventListener('click', function () {
  for (let i = 0; i <= 3; i++) {
    // Function to call "Words API" for random word
    getRandomWord(i);
    function getRandomWord(n) {
      fetch('https://wordsapiv1.p.rapidapi.com/words/?random=true', {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '47de2ec1bfmsh3e9119d6a18e315p16d88ejsn8fb3d33e52c8',
          'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
        },
      }).then((response) => {
        if (response.ok) {
          response.json().then(function (data) {
            var word = data.word;
            /* YOUTUBE API START ---------------------------------------*/
            var request = gapi.client.youtube.search.list({
              part: 'snippet',
              type: 'video',
              q: encodeURIComponent(word).replace(/%20/g, '+'),
              maxResults: 1,
              order: 'relevance',
            });

            request.execute(function (response) {
              if (response.code === 403) {
                // If error = 403, disable the Get Random Search button
                $('#btnSearch').prop('disabled', true);
                // If error = 403, show text for quota limit
                $('#quota').removeClass('hidden');
              } else {
                $('#btnSearch').prop('disabled', false);
                function updateVideo(id) {
                  fnPlayer.loadVideoById({
                    videoId: id,
                  });
                  fnPlayer.stopVideo();
                }
                var videoUpdate = String(response.result.items[0].id.videoId);
                var playerCat = String(`player${n + 1}`);
                var fnPlayer = window[playerCat];
                saveIdToLocal(response.result.items[0].id.videoId);
                updateVideo(videoUpdate);
              }
            });

            /* YOUTUBE API END -----------------------------------------*/
          });
        }
      });
    }
    updateWindow();
  }
});

// SAVE YOUTUBE ID TO LOCAL STORAGE FOR
function saveIdToLocal(id) {
  var videoArrayLocal = localStorage.getItem('videoid');
  videoArrayLocal = videoArrayLocal ? JSON.parse(videoArrayLocal) : [];
  videoArrayLocal.push(id);
  localStorage.setItem('videoid', JSON.stringify(videoArrayLocal));
}

// -------------------------------------------------------------
// YOUTUBE API IFRAME
// -------------------------------------------------------------

function updateWindow() {
  if (typeof tag === 'undefined') {
    // if first run load the YT API which will call the correct functions.
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } else {
    // if YT api already loaded, we need to call the function.
    onYouTubeIframeAPIReady();
  }
}

var player1,
  player2,
  player3,
  player4 = 0;

function onYouTubeIframeAPIReady() {
  player1 = new YT.Player('player-1', {
    videoId: '_MXJGOPBHi4',
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onError,
    },
  });
  player2 = new YT.Player('player-2', {
    videoId: 'JZc94cO54kY',
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onError,
    },
  });
  player3 = new YT.Player('player-3', {
    videoId: 'AzV77KFsLn4',
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onError,
    },
  });
  player4 = new YT.Player('player-4', {
    videoId: 'McOV9mHct94',
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onError,
    },
  });
}

function onPlayerReady() {
  // Set Volume on Unmute + Displaye Speed =1
  setOnLoad();
  // Set intervals
  setIntervals();
}

// -------------------------------------------------------------
// ERROR HANDLING | DELETE
// -------------------------------------------------------------
// TODO to handle error on video load
// Currently works for shuffle, but need to fix for get Random
function onError(error) {
  var errorVideoID = error.target.playerInfo.videoData.video_id;
  var errorPlayer = error.target.h.id;
  var errorPlayerNum = Number(errorPlayer.substr(-1) - 1);

  // On Player Error - Remove video ID from Local Storage
  deleteVideoID(errorVideoID);
  // Once Removed - Click On the Shuffle Button
  btnShuffle[errorPlayerNum].click();
}

// Delete Video That Errors Out
function deleteVideoID(videoid) {
  var videoArrayLocal = JSON.parse(localStorage.getItem('videoid'));
  // Check videoID position + Remove
  videoArrayLocal.splice(videoArrayLocal.indexOf(videoid), 1);
  // Reset local storage
  localStorage.setItem('videoid', JSON.stringify(videoArrayLocal));
}

// -------------------------------------------------------------
// ON IFRAME STATE CHANGE EVENT FUNCTION
// -------------------------------------------------------------
// Function to detect when video has ended & reset intervals
function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.CUED:
      clearIntervals(); // clear all intervals
      break;
    case YT.PlayerState.ENDED:
      clearIntervals(); // clear all intervals
      break;
    default:
      clearIntervals(); // clear all intervals
      break;
  }
}

// -------------------------------------------------------------
// DISPLAY SETTINGS ON PAGE LOAD
// -------------------------------------------------------------
// To load initial display settings for Speed + Volume Focus
function setOnLoad() {
  for (let i = 0; i < iframeCount; i++) {
    var speedEl = String(`.speed-${i + 1}`);
    var speedHTML = document.querySelectorAll(speedEl)[3];
    speedHTML.checked = true;
    btnUnMute[i].classList.add('is-focused');
  }
}

// -------------------------------------------------------------
// UPDATE DISPLAY SETTINGS ON CHANGE
// -------------------------------------------------------------
function update(node) {
  switch (node) {
    // Update player reported changes
    case 'currentTime':
      $('#currentTime1').html(formatTime(player1.getCurrentTime()));
      $('#currentTime2').html(formatTime(player2.getCurrentTime()));
      $('#currentTime3').html(formatTime(player3.getCurrentTime()));
      $('#currentTime4').html(formatTime(player4.getCurrentTime()));
      break;
    case 'durationTime':
      $('#duration1').html(formatTime(player1.getDuration()));
      $('#duration2').html(formatTime(player2.getDuration()));
      $('#duration3').html(formatTime(player3.getDuration()));
      $('#duration4').html(formatTime(player4.getDuration()));
      break;
    case 'percentLoaded':
      var progress1 = (player1.getCurrentTime() / player1.getDuration()) * 100;
      var progress2 = (player2.getCurrentTime() / player2.getDuration()) * 100;
      var progress3 = (player3.getCurrentTime() / player3.getDuration()) * 100;
      var progress4 = (player4.getCurrentTime() / player4.getDuration()) * 100;
      $('#progSlider1 span').css('left', progress1 + '%');
      $('#progSlider2 span').css('left', progress2 + '%');
      $('#progSlider3 span').css('left', progress3 + '%');
      $('#progSlider4 span').css('left', progress4 + '%');
      break;
  }
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// EVENT LISTENERS:
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

// PLAY BUTTONS ------------------------------------------------
for (let i = 0; i < btnPlay.length; i++) {
  btnPlay[i].addEventListener('click', () => {
    var playerCat = String(`player${i + 1}`);
    var fnPlayer = window[playerCat];

    if (fnPlayer.getPlayerState() === 2) {
      fnPlayer.seekTo(fnPlayer.getCurrentTime(), true);
    } else if (fnPlayer.getPlayerState() === -1) {
      fnPlayer.seekTo(0, true);
    } else if (fnPlayer.getPlayerState() === 5) {
      fnPlayer.seekTo(0, true);
    }
    fnPlayer.playVideo();
  });
}

// PAUSE BUTTONS -----------------------------------------------
for (let i = 0; i < btnPause.length; i++) {
  btnPause[i].addEventListener('click', () => {
    var playerCat = String(`player${i + 1}`);
    var fnPlayer = window[playerCat];

    fnPlayer.pauseVideo();
  });
}

// STOP BUTTONS ------------------------------------------------
for (let i = 0; i < btnStop.length; i++) {
  btnStop[i].addEventListener('click', () => {
    var playerCat = String(`player${i + 1}`);
    var fnPlayer = window[playerCat];

    var progSlider = String(`#progSlider${i + 1} span`);

    // To set progress value to zero
    $(progSlider).css('left', 0 + '%');

    fnPlayer.stopVideo();
  });
}

// MUTE BUTTONS ------------------------------------------------
for (let i = 0; i < btnMute.length; i++) {
  btnMute[i].addEventListener('click', () => {
    var playerCat = String(`player${i + 1}`);
    var fnPlayer = window[playerCat];

    btnMute[i].classList.toggle('is-focused');
    btnUnMute[i].classList.toggle('is-focused');
    fnPlayer.mute();
  });
}

// UNMUTE BUTTONS ----------------------------------------------
for (let i = 0; i < btnUnMute.length; i++) {
  btnUnMute[i].addEventListener('click', () => {
    var playerCat = String(`player${i + 1}`);
    var fnPlayer = window[playerCat];

    btnMute[i].classList.toggle('is-focused');
    btnUnMute[i].classList.toggle('is-focused');
    fnPlayer.unMute();
  });
}

// SPEED CONTROL -----------------------------------------------
for (let i = 0; i < speedLabel.length; i++) {
  speedLabel[i].addEventListener('click', () => {
    // gets the number value from the class
    var j = speedLabel[i].classList.value.substr(-1);
    // gets the value for the input box
    var rate = Number(speedLabel[i].value);

    var playerCat = String(`player${j}`);
    var fnPlayer = window[playerCat];

    fnPlayer.setPlaybackRate(rate);
  });
}

// SHUFFLE CONTROL -----------------------------------------------

for (let i = 0; i < btnShuffle.length; i++) {
  btnShuffle[i].addEventListener('click', () => {
    var shuffleCat = String(`playlist_${i + 1}`);
    var fnList = window[shuffleCat];
    var localVideos = JSON.parse(localStorage.getItem('videoid'));
    var shuffleVideo = localVideos[Math.floor(Math.random() * localVideos.length)];

    var playerCat = String(`player${i + 1}`);
    var fnPlayer = window[playerCat];

    fnPlayer.loadVideoById({
      videoId: shuffleVideo,
    });
    fnPlayer.seekTo(0, true);
  });
}

// VOLUME BAR --------------------------------------------------
// Jquery For Volume Bar
$(function () {
  var myslider = $('#volSlider1,#volSlider2,#volSlider3,#volSlider4').slider({
    value: 100,
    min: 0,
    max: 100,
    step: 1,
    slide: function (event, ui) {
      var numSlider = event.target.id.substr(-1);
      var volEl = `#volValue${numSlider}`;
      var playerCat = String(`player${numSlider}`);
      var fnPlayer = window[playerCat];
      $(volEl).html(ui.value);
      fnPlayer.setVolume(ui.value);
    },
  });
});

// PROGRESS BAR ------------------------------------------------

$(function () {
  var myslider = $('#progSlider1,#progSlider2,#progSlider3,#progSlider4').slider({
    value: 0,
    min: 0,
    max: 100,
    step: 1,
    slide: function (event, ui) {
      var numSlider = event.target.id.substr(-1);
      var currTimeEl = `#currentTime${numSlider}`;
      var playerCat = String(`player${numSlider}`);
      var fnPlayer = window[playerCat];
      var newTime = fnPlayer.getDuration() * (ui.value / 100);
      fnPlayer.seekTo(newTime);
    },
  });
});

// -------------------------------------------------------------
// SETINTERVALS + CLEARINTERVALS
// -------------------------------------------------------------

// Controls interval handlers to update page
var activeIntervals = [];
function setIntervals() {
  // Sets invertval funtions to actively update page content
  activeIntervals[0] = setInterval(function () {
    update('currentTime');
  }, 1000);
  activeIntervals[1] = setInterval(function () {
    update('durationTime');
  }, 500);
  activeIntervals[2] = setInterval(function () {
    update('percentLoaded');
  }, 1000);
}

function clearIntervals() {
  // Clears existing intervals to actively update page content
  for (var interval in activeIntervals) {
    clearInterval(interval);
  }
}

// -------------------------------------------------------------
// FORMAT TIMER
// -------------------------------------------------------------

function formatTime(time) {
  time = Math.round(time);

  var minutes = Math.floor(time / 60),
    seconds = time - minutes * 60;

  seconds = seconds < 10 ? '0' + seconds : seconds;

  return minutes + ':' + seconds;
}

// -------------------------------------------------------------
// TO UPDATE YOUTUBE IFRAMES SCRIPT
// -------------------------------------------------------------
updateWindow();

// -------------------------------------------------------------
// TO AUTHORIZE YOUTUBE API KEY WITH GOOGLE
// -------------------------------------------------------------
function init() {
  gapi.client.setApiKey(youtubeAPIKey);
  gapi.client.load('youtube', 'v3', function () {});
}
