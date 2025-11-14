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

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    // Initial pick based on current select value
    if(difficultySelect){
      chooseAndDisplay(difficultySelect.value || 'easy');

      // Update when the user changes difficulty
      difficultySelect.addEventListener('change', function(e){
        chooseAndDisplay(e.target.value);
      });
    } else {
      // fallback
      chooseAndDisplay('easy');
    }
  });

})();
