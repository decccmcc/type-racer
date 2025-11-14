// main.js - difficulty-based sample text selection

(function(){
  // Predefined sample texts for each difficulty level
  const samples = {
    easy: [
      "The cat sat on the mat.",
      "A quick brown fox jumps over the dog.",
      "She sells seashells by the seashore."
    ],
    medium: [
      "When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow.",
      "Typing quickly requires practice; steady, regular exercises build both speed and accuracy.",
      "Learning to touch type will let you keep your eyes on the screen rather than on the keys."
    ],
    hard: [
      "The juxtaposition of rapidly evolving technologies and long-standing institutions creates intriguing tensions.",
      "Serendipity often rewards those who consistently expose themselves to new ideas and persistent effort.",
      "Perseverance, combined with deliberate practice and focused feedback, reliably improves performance over time."
    ]
  };

  // Utility: choose a random element from an array
  function randomFrom(arr){
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Get DOM elements
  const difficultySelect = document.getElementById('difficulty');
  const promptBox = document.getElementById('prompt-box');
  const typingArea = document.getElementById('typing-area');

  // Choose and display a sample for the given difficulty key ('easy'|'medium'|'hard')
  function chooseAndDisplay(difficulty){
    const key = (difficulty || '').toLowerCase();
    const bucket = samples[key] || samples.easy;
    const text = randomFrom(bucket);
    if(promptBox){
      promptBox.textContent = text;
    }
    // Clear typing area when a new prompt is chosen
    if(typingArea){
      typingArea.value = '';
    }
  }

  // --- Timing logic: named functions for clarity ---
  let startBtn, stopBtn, resTimeSpan;
  let testStartTimestamp = null;

  function startTest(){
    // record high-resolution start time
    testStartTimestamp = performance.now();

    // Clear typing area when test starts and enable input
    if(typingArea){
      typingArea.value = '';       // clear any existing text
      typingArea.disabled = false; // enable while running
      typingArea.focus();
    }

    // UI state: disable start, enable stop
    if(startBtn) startBtn.disabled = true;
    if(stopBtn) stopBtn.disabled = false;
    // clear previous result time display while test is running
    if(resTimeSpan) resTimeSpan.textContent = '0s';
  }

  function stopTest(){
    if(testStartTimestamp === null) return; // nothing to stop
    const elapsedMs = performance.now() - testStartTimestamp;
    const seconds = +(elapsedMs / 1000).toFixed(2);
    if(resTimeSpan) resTimeSpan.textContent = seconds + 's';

    // Disable typing area once test ends
    if(typingArea){
      typingArea.disabled = true;
      typingArea.blur();
    }

    // UI state: re-enable start, disable stop
    if(startBtn) startBtn.disabled = false;
    if(stopBtn) stopBtn.disabled = true;
    // reset stored start time
    testStartTimestamp = null;
  }
  // --- end timing logic ---

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    // Initial pick based on current select value
    if(difficultySelect){
      chooseAndDisplay(difficultySelect.value || 'easy');

      // Update when the user changes difficulty
      difficultySelect.addEventListener('change', function(e){
        chooseAndDisplay(e.target.value);
        // also update displayed level in results area if present
        const resLevel = document.getElementById('res-level');
        if(resLevel) resLevel.textContent = (e.target.value || 'easy').replace(/^\w/, c => c.toUpperCase());
      });
    } else {
      // fallback
      chooseAndDisplay('easy');
    }

    // Hook up control buttons and result span
    startBtn = document.getElementById('start-btn');
    stopBtn = document.getElementById('stop-btn');
    resTimeSpan = document.getElementById('res-time');

    // initial button states: start enabled, stop disabled
    if(startBtn) startBtn.disabled = false;
    if(stopBtn) stopBtn.disabled = true;

    // Ensure typing area is disabled until test starts
    if(typingArea) typingArea.disabled = true;

    // attach named handlers
    if(startBtn) startBtn.addEventListener('click', startTest);
    if(stopBtn) stopBtn.addEventListener('click', stopTest);
  });

})();
