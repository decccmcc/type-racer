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

  // Current sample words for live comparison
  let currentSampleWords = [];

  // Render prompt text as individual word <span> elements
  function renderPromptAsSpans(text){
    currentSampleWords = text ? text.trim().split(/\s+/) : [];
    if(!promptBox) return;
    promptBox.innerHTML = '';
    currentSampleWords.forEach(function(word, idx){
      const span = document.createElement('span');
      span.textContent = word;
      span.dataset.index = String(idx);
      span.className = 'prompt-word';
      // reset any inline color
      span.style.color = '';
      promptBox.appendChild(span);
      // preserve spaces between words
      promptBox.appendChild(document.createTextNode(' '));
    });
  }

  // Normalize a token by stripping leading/trailing punctuation and lowercasing
  function normalizeWord(token){
    try {
      return (token || '').replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();
    } catch (e) {
      // Fallback if \p Unicode property escapes unsupported
      return (token || '').replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').toLowerCase();
    }
  }

  // Update colors of prompt-word spans based on current user input
  function updateWordColors(){
    if(!promptBox || !typingArea) return;
    const userText = typingArea.value.trim();
    const userWords = userText ? userText.split(/\s+/) : [];

    for(let i = 0; i < currentSampleWords.length; i++){
      const span = promptBox.querySelector('span[data-index="' + i + '"]');
      if(!span) continue;
      const sampleNorm = normalizeWord(currentSampleWords[i]);
      const userNorm = normalizeWord(userWords[i] || '');

      if(!userWords[i]) {
        // not typed yet -> default color
        span.style.color = '';
      } else if(userNorm === sampleNorm){
        // correct word
        span.style.color = 'blue';
      } else {
        // incorrect word
        span.style.color = 'red';
      }
    }
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
    // Render the prompt as word spans so we can colour individual words
    renderPromptAsSpans(text);
    // Clear typing area when a new prompt is chosen
    if(typingArea){
      typingArea.value = '';
      // ensure colours are reset when prompt changes
      updateWordColors();
    }
  }
  
  // --- Timing logic: named functions for clarity ---
  let startBtn, stopBtn, resTimeSpan;
  let resWpmSpan;
  let testStartTimestamp = null;

  // Calculate WPM based on positional word matches (uses promptBox and typingArea)
  function calculateWPM(timeTaken){
    // timeTaken is in seconds
    const sampleText = (promptBox ? promptBox.textContent : '').trim();
    const userText = (typingArea ? typingArea.value : '').trim();

    if(!timeTaken || timeTaken <= 0) return 0;

    const sampleWords = sampleText ? sampleText.split(/\s+/) : [];
    const userWords = userText ? userText.split(/\s+/) : [];

    let correctWords = 0;
    for(let i = 0; i < userWords.length; i++){
      if(userWords[i] === sampleWords[i]) correctWords++;
    }

    return Math.round((correctWords / timeTaken) * 60);
  }

  function startTest(){
    // record high-resolution start time
    testStartTimestamp = performance.now();

    // Clear typing area when test starts and enable input
    if(typingArea){
      // Do NOT clear the textarea here — tests start when the user types
      typingArea.disabled = false; // enable while running
      typingArea.focus();
      // Reset live colouring when a test starts
      updateWordColors();
    }

    // UI state: disable start, enable stop
    if(startBtn) startBtn.disabled = true;
    if(stopBtn) stopBtn.disabled = false;
    // clear previous result time display while test is running
    if(resTimeSpan) resTimeSpan.textContent = '0s';
    // clear WPM display while running
    if(resWpmSpan) resWpmSpan.textContent = '0';
    // update displayed level in results to current difficulty
    const resLevel = document.getElementById('res-level');
    if(resLevel && difficultySelect) resLevel.textContent = (difficultySelect.value || 'easy').replace(/^\w/, c => c.toUpperCase());
  }

  // Start the test when the user begins typing (only once)
  function startTestIfNeeded(){
    if(testStartTimestamp === null){
      startTest();
    }
  }

  function stopTest(){
    if(testStartTimestamp === null) return; // nothing to stop
    const elapsedMs = performance.now() - testStartTimestamp;
    const seconds = +(elapsedMs / 1000).toFixed(2);
    if(resTimeSpan) resTimeSpan.textContent = seconds + 's';

    // show final colors before computing WPM
    updateWordColors();

    // Calculate WPM by comparing user words to sample words positionally
    const wpm = calculateWPM(seconds);
    if(resWpmSpan) resWpmSpan.textContent = String(wpm);

    // ensure results show selected difficulty
    const resLevel = document.getElementById('res-level');
    if(resLevel && difficultySelect) resLevel.textContent = (difficultySelect.value || 'easy').replace(/^\w/, c => c.toUpperCase());

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
    // Live update as the user types; start test on first input
    if(typingArea){
      // Enable typing area so users can start typing to begin the test
      typingArea.disabled = false;
      typingArea.placeholder = 'Start typing to begin the test';
      // on input: start test if needed, then update colours
      typingArea.addEventListener('input', function(evt){
        startTestIfNeeded();
        updateWordColors();
      });
      // on Enter key: stop the test (prevent newline)
      typingArea.addEventListener('keydown', function(evt){
        if(evt.key === 'Enter'){
          // If the test has not started yet, ignore Enter
          if(testStartTimestamp === null) return;
          evt.preventDefault();
          stopTest();
        }
      });
    }

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
    resWpmSpan = document.getElementById('res-wpm');

    // initial button states: start enabled, stop disabled
    if(startBtn) startBtn.disabled = false;
    if(stopBtn) stopBtn.disabled = true;

    // Replace the Start/Stop buttons UI: hide them because tests start on typing and end on Enter
    if(startBtn) startBtn.style.display = 'none';
    if(stopBtn) stopBtn.style.display = 'none';

    // ensure results initial values match UI
    const resLevelInit = document.getElementById('res-level');
    if(resLevelInit && difficultySelect) resLevelInit.textContent = (difficultySelect.value || 'easy').replace(/^\w/, c => c.toUpperCase());
    if(resWpmSpan) resWpmSpan.textContent = '0';

    // attach named handlers
    // Keep retry button as-is (if present) — start/stop are handled by typing and Enter.
  });

})();
