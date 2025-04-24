// Bingo Game JavaScript Code
    // Game state object to track everything
    const game = {
      selectedColor: 'red',
      calledNumbers: new Set(),
      isAutoCalling: false,
      autoCallInterval: null,
      playerCards: [],
      sounds: {}, // Object to store sounds
      language: 'en' // Default language
    };

    // Initialize the game when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      console.log("DOMContentLoaded event fired.");
      generateMainBoard();
      generatePlayerCard(); // Call generatePlayerCard()
      setupEventListeners();
      
      // Set red as default selected color
      document.getElementById('colorRed').style.border = '2px solid black';

      updateRemainingNumbersCount(); // Initial call to display count
      loadSounds(); // Load sounds on startup
    });

    // Load sounds
    function loadSounds(language = 'en') {
      console.log(`Loading sounds for language: ${language}...`);
      game.language = language; // Update the game language
      for (let i = 1; i <= 75; i++) {
        const soundPath = `sounds/${language}/${i}.mp3`;
        console.log(`Loading sound from: ${soundPath}`);
        game.sounds[i] = new Audio(soundPath);
      }
      console.log(`Sounds loaded for language: ${language}.`);
    }

    // Generate the main bingo board
    function generateMainBoard() {
      console.log("Generating main board...");
      const board = document.getElementById('mainBoard');
      if (!board) {
        console.error("Error: mainBoard element not found!");
        return;
      }
      const ranges = {
        B: [1, 15],
        I: [16, 30],
        N: [31, 45],
        G: [46, 60],
        O: [61, 75]
      };

      // Clear existing rows
      while (board.rows.length > 0) {
        board.deleteRow(0);
      }

      // Create header row with number ranges
      const headerRow = board.insertRow();
      for (const letter in ranges) {
        const th = document.createElement('th');
        th.textContent = `${letter} (${ranges[letter][0]}-${ranges[letter][1]})`;
        th.colSpan = 2; // Span two columns
        headerRow.appendChild(th);
      }

      // Create rows for numbers
      for (let i = 0; i < 8; i++) {
        const row = board.insertRow();
        for (const letter in ranges) {
          const min = ranges[letter][0];
          const max = ranges[letter][1];
          const num1 = min + i;
          const num2 = min + i + 8; // Ensure numbers stay within range

          const cell1 = row.insertCell();
          cell1.textContent = num1 <= max ? num1 : ''; // Display number or empty string
          cell1.dataset.number = num1 <= max ? num1 : '';
          cell1.dataset.letter = letter;

          const cell2 = row.insertCell();
          cell2.textContent = num2 <= max ? num2 : ''; // Display number or empty string
          cell2.dataset.number = num2 <= max ? num2 : '';
          cell2.dataset.letter = letter;
        }
      }
      console.log("Main board generated.");
    }

    // Generate a blank player card
    function generatePlayerCard() {
      console.log("Generating player card...");
      const card = document.getElementById('playerCard');
      if (!card) {
        console.error("Error: playerCard element not found!");
        return;
      }

      // Clear existing rows (except header and footer)
      while (card.rows.length > 2) { // Keep header and footer
        card.deleteRow(1);
      }

      // Create 5 rows (5 columns each)
      for (let i = 0; i < 5; i++) {
        const row = card.insertRow(1 + i); // Insert after header
        for (let j = 0; j < 5; j++) {
          const cell = row.insertCell();
          //cell.contentEditable = true; // Remove contenteditable attribute

          // FREE space in the center
          if (i === 2 && j === 2) {
            cell.textContent = 'F'; // Change to "F"
            cell.style.backgroundColor = 'blue';
            cell.style.color = 'white';
            //cell.contentEditable = false; // Remove contenteditable attribute
          }
        }
      }
      console.log("Player card generated.");
    }

    // Set up all event listeners
    function setupEventListeners() {
      console.log("Setting up event listeners...");
      
      // Search Card button
      const searchCardBtn = document.getElementById('searchCardBtn');
      if (searchCardBtn) {
        console.log("Found searchCardBtn, adding event listener");
        searchCardBtn.addEventListener('click', function() {
          console.log("Search button clicked");
          searchCard();
        });
      } else {
        console.error("Error: searchCardBtn element not found!");
      }

      // Close modal button
      const closeBtn = document.getElementsByClassName("close")[0];
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          const modal = document.getElementById('cardModal');
          modal.style.display = 'none';
        });
      }

      // Close modal when clicking outside
      window.addEventListener('click', function(event) {
        const modal = document.getElementById('cardModal');
        if (event.target == modal) {
          modal.style.display = 'none';
        }
      });

      // Main board click handler
      const mainBoard = document.getElementById('mainBoard');
      if (mainBoard) {
        mainBoard.addEventListener('click', function(e) {
          if (e.target.tagName === 'TD') {
            const number = e.target.dataset.number;
            
            if (game.calledNumbers.has(number)) {
              e.target.style.backgroundColor = '';
              e.target.style.color = '#333';
              game.calledNumbers.delete(number);
            } else {
              e.target.style.backgroundColor = 'blue';
              e.target.style.color = 'white';
              game.calledNumbers.add(number);
            }
          }
        });
      } else {
        console.error("Error: mainBoard element not found!");
      }

      // Player card click handler
      const playerCard = document.getElementById('playerCard');
      if (playerCard) {
        playerCard.addEventListener('click', function(e) {
          const cell = e.target;
          if (cell.tagName === 'TD' && cell.textContent !== 'F') { // Check if not "F"
            cell.style.backgroundColor = game.selectedColor;
            cell.textContent = ''; // Remove any existing text
          }
        });
      } else {
        console.error("Error: playerCard element not found!");
      }

      // Color selection
      document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
          game.selectedColor = this.style.backgroundColor;
          document.querySelectorAll('.color-option').forEach(opt => {
            opt.style.border = '2px solid white';
          });
          this.style.border = '2px solid black';
        });
      });

      // New Game button
      const newGameBtn = document.getElementById('newGameBtn');
      if (newGameBtn) {
        newGameBtn.addEventListener('click', resetGame);
      } else {
        console.error("Error: newGameBtn element not found!");
      }

      // Register Card button
      const registerBtn = document.getElementById('registerBtn');
      if (registerBtn) {
        registerBtn.addEventListener('click', registerCard);
      } else {
        console.error("Error: registerBtn element not found!");
      }

      // Call Numbers button
      const playBtn = document.getElementById('playBtn');
      if (playBtn) {
        playBtn.addEventListener('click', callNumbers);
      } else {
        console.error("Error: playBtn element not found!");
      }

      // Auto-call button
      const autoCallBtn = document.getElementById('autoCallBtn');
      if (autoCallBtn) {
        autoCallBtn.addEventListener('click', toggleAutoCall);
      } else {
        console.error("Error: autoCallBtn element not found!");
      }
      
      // Reset Player Card Function
      const resetPlayerCardBtn = document.getElementById('resetPlayerCardBtn');
      if (resetPlayerCardBtn) {
        resetPlayerCardBtn.addEventListener('click', function () {
          const playerCard = document.getElementById('playerCard');
          for (let i = 1; i < playerCard.rows.length - 1; i++) { // Exclude the footer row
            const row = playerCard.rows[i];
            for (let j = 0; j < row.cells.length; j++) {
              const cell = row.cells[j];
              if (i !== 3 || j !== 2) { // Keep "F" cell
                cell.textContent = ''; // Clear cell content
                cell.style.backgroundColor = ''; // Reset background color
                cell.style.color = ''; // Reset text color
              }
            }
          }
          alert('Player card has been reset!');
        });
      } else {
        console.error("Error: resetPlayerCardBtn element not found!");
      }

      // Color Editor Functionality for Player Card
      document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function () {
          const selectedColor = this.style.backgroundColor;
          document.getElementById('playerCard').addEventListener('click', function (e) {
            if (e.target.tagName === 'TD') {
              e.target.style.backgroundColor = selectedColor; // Apply selected color
            }
          });
        });
      });

      console.log("Event listeners set up.");
    }

    // Reset the entire game
    function resetGame() {
      console.log("Resetting game...");
      // Create a modal for the confirmation message
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.backgroundColor = 'black';
      modal.style.padding = '20px';
      modal.style.border = '1px solid black';
      modal.style.zIndex = '10000';
      modal.style.textAlign = 'center';
      modal.style.color = 'white';

      // Add the warning message
      const message = document.createElement('p');
      message.textContent = 'Are you sure you want to start a new game? This will reset everything.';
      modal.appendChild(message);

      // Create buttons for "OK" and "Cancel"
      const okButton = document.createElement('button');
      okButton.textContent = 'OK';
      okButton.style.margin = '10px';
      okButton.addEventListener('click', function() {
        // Clear called numbers
        game.calledNumbers.clear();

        // Stop auto-call if running
        if (game.isAutoCalling) {
          clearInterval(game.autoCallInterval);
          game.isAutoCalling = false;
          document.getElementById('autoCallBtn').textContent = 'Auto-call';
        }

        // Regenerate boards
        generateMainBoard();
        generatePlayerCard();

        // Clear registered cards
        game.playerCards = [];

        // Remove the modal
        document.body.removeChild(modal);
      });
      modal.appendChild(okButton);

      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.style.margin = '10px';
      cancelButton.addEventListener('click', function() {
        // Remove the modal
        document.body.removeChild(modal);
      });
      modal.appendChild(cancelButton);

      // Add the modal to the body
      document.body.appendChild(modal);
      console.log("Game reset.");
    }

    // Register a player card
    function registerCard() {
      console.log("Registering card...");
      // Open a new window
      const win = window.open('', '_blank');
      win.document.write(`
        <html>
          <head>
            <title>Register Bingo Card</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              h1 { color: #007bff; }
              button { background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px; }
            </style>
          </head>
          <body>
            <h1>Register Bingo Card</h1>
            <p>Choose how you want to generate your Bingo card:</p>
            <button id="manualBtn">Generate Manually</button>
            <button id="autoBtn">Generate Automatically</button>
            <script>
              document.getElementById('manualBtn').addEventListener('click', function() {
                // Redirect to manual card generation page
                window.location.href = 'manual_card.html';
              });
              document.getElementById('autoBtn').addEventListener('click', function() {
                // Redirect to automatic card generation page
                window.location.href = 'auto_card.html';
              });
            </script>
          </body>
        </html>
      `);
      win.document.close();
      console.log("Card registration window opened.");
    }

    // Call numbers sequentially
    function callNumbers() {
      console.log("Calling numbers...");
      const availableNumbers = [];
      const board = document.getElementById('mainBoard');

      // Find all numbers not yet called
      for (let i = 1; i < board.rows.length; i++) {
        const row = board.rows[i];
        for (let j = 0; j < row.cells.length; j++) {
          const number = row.cells[j].dataset.number;
          if (number && !game.calledNumbers.has(number)) {
            availableNumbers.push(number);
          }
        }
      }

      if (availableNumbers.length === 0) {
        alert('All numbers have been called!');
        return;
      }

      // Shuffle available numbers
      availableNumbers.sort(() => Math.random() - 0.5);

      // Call the first number
      const number = availableNumbers.pop();
      game.calledNumbers.add(number);

      // Play sound
      playSound(number);

      // Highlight the called number on the board
      const cells = document.querySelectorAll(`#mainBoard td[data-number="${number}"]`);
      cells.forEach(cell => {
        cell.style.backgroundColor = 'red';
        cell.style.color = 'white';
      });

      // Mark in player cards
      game.playerCards.forEach(card => {
        card.calledNumbers.add(number);
      });

      updateRemainingNumbers(number);

      console.log(`Called number: ${number}`);
    }

    // Toggle auto-call functionality
    function toggleAutoCall() {
        console.log("Toggling auto-call...");
        if (game.isAutoCalling) {
            // Stop auto-calling
            clearInterval(game.autoCallInterval);
            game.isAutoCalling = false;
            document.getElementById('autoCallBtn').textContent = 'Auto-call';
            return;
        }

        // Start auto-calling
        game.isAutoCalling = true;
        document.getElementById('autoCallBtn').textContent = 'Stop Auto-call';

        const availableNumbers = [];
        const board = document.getElementById('mainBoard');

        // Find all numbers not yet called
        for (let i = 1; i < board.rows.length; i++) {
            const row = board.rows[i];
            for (let j = 0; j < row.cells.length; j++) {
                const number = row.cells[j].dataset.number;
                if (!game.calledNumbers.has(number)) {
                    availableNumbers.push(number);
                }
            }
        }

        if (availableNumbers.length === 0) {
            alert('All numbers have been called!');
            game.isAutoCalling = false;
            document.getElementById('autoCallBtn').textContent = 'Auto-call';
            return;
        }

        // Shuffle available numbers
        availableNumbers.sort(() => Math.random() - 0.5);

        game.autoCallInterval = setInterval(() => {
            if (availableNumbers.length === 0) {
                clearInterval(game.autoCallInterval);
                game.isAutoCalling = false;
                document.getElementById('autoCallBtn').textContent = 'Auto-call';
                alert('All numbers have been called!');
                return;
            }

            const number = availableNumbers.pop();
            game.calledNumbers.add(number);

            // Play sound
            playSound(number);

            // Highlight the called number on the board
            const cells = document.querySelectorAll(`#mainBoard td[data-number="${number}"]`);
            cells.forEach(cell => {
                cell.style.backgroundColor = 'blue';
                cell.style.color = 'white';
            });

            updateRemainingNumbers(number);

            console.log(`Auto-called number: ${number}`);
        }, 2000);
        console.log("Auto-call toggled.");
    }

    // Function to play sound for a number
    function playSound(number) {
      console.log(`playSound called with number: ${number}`);
      if (game.sounds[number]) {
        console.log(`Sound found for number: ${number}`);
        game.sounds[number].play();
      } else {
        console.warn(`Sound not found for number: ${number}`);
      }
    }

  // Function to update remaining numbers display when a number is called
  function updateRemainingNumbers(number) {
      // No need to do anything here since we're only displaying the count
      updateRemainingNumbersCount(); // Update the count after each call
  }

  // Function to generate remaining numbers display
  function updateRemainingNumbersCount() {
    const remainingNumbersCountDiv = document.getElementById('remainingNumbersCount');
    if (!remainingNumbersCountDiv) {
      console.error("Error: remainingNumbersCountDiv element not found!");
      return;
    }
    const remainingCount = 75 - game.calledNumbers.size;
    remainingNumbersCountDiv.textContent = `Numbers Remaining: ${remainingCount}`;
  }

    // Search Card Function
    function searchCard() {
        console.log("Starting searchCard function");
        const cardNumber = document.getElementById('cardNumberSearch').value;
        console.log("Searching for card number:", cardNumber);
        
        if (!cardNumber) {
            console.log("No card number entered");
            alert('Please enter a card number!');
            return;
        }

        const savedCards = getSavedCards();
        console.log("All saved cards:", JSON.stringify(savedCards, null, 2));
        
        const card = savedCards.find(card => card.cardNumber === cardNumber);
        console.log("Found card:", JSON.stringify(card, null, 2));

        if (card) {
            console.log("Card found, displaying...");
            displayCard(card);
        } else {
            console.log("Card not found");
            alert('Card not found! Please check the card number.');
        }
    }

    function getSavedCards() {
        try {
            const savedCards = localStorage.getItem('registeredCards');
            console.log("Raw saved cards from localStorage:", savedCards);
            const parsedCards = savedCards ? JSON.parse(savedCards) : [];
            console.log("Parsed cards:", parsedCards);
            return parsedCards;
        } catch (error) {
            console.error("Error parsing saved cards from localStorage:", error);
            return [];
        }
    }

    // Function to display card
    function displayCard(card) {
        console.log("Starting displayCard function");
        console.log("Full card data:", JSON.stringify(card, null, 2));
        
        // Get the modal and content elements
        const modal = document.getElementById('cardModal');
        const cardContent = document.getElementById('cardContent');
        console.log("Modal element:", modal);
        
        if (!modal || !cardContent) {
            console.error("Error: modal elements not found!");
            return;
        }

        // Clear previous content
        cardContent.innerHTML = '';

        // Create table element
        const table = document.createElement('table');
        table.classList.add('displayed-card');
        table.style.border = '2px solid #333';
        table.style.borderCollapse = 'collapse';
        table.style.margin = '10px auto';
        table.style.width = '100%';
        table.style.backgroundColor = 'white';

        // Create header row
        const headerRow = table.insertRow();
        ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
            const th = document.createElement('th');
            th.textContent = letter;
            th.style.border = '1px solid #333';
            th.style.padding = '8px';
            th.style.backgroundColor = '#f0f0f0';
            th.style.fontWeight = 'bold';
            headerRow.appendChild(th);
        });

        // Create number rows
        let cardIndex = 0;
        for (let i = 0; i < 5; i++) {
            const row = table.insertRow();
            for (let j = 0; j < 5; j++) {
                const cell = row.insertCell();
                if (i === 2 && j === 2) {
                    // FREE space
                    cell.textContent = 'FREE';
                    cell.style.backgroundColor = 'blue';
                    cell.style.color = 'white';
                } else {
                    const cellData = card.numbers[cardIndex];
                    const number = typeof cellData === 'object' ? cellData.number : cellData;
                    cell.textContent = number;
                }
                cell.style.border = '1px solid #333';
                cell.style.padding = '8px';
                cell.style.textAlign = 'center';
                cell.style.fontSize = '16px';
                cardIndex++;
            }
        }

        // Add the table to the display
        cardContent.appendChild(table);
        modal.style.display = "block";
        console.log("Card display updated");
    }

    // Function to save card to localStorage (centralized)
    function saveCardToLocalStorage(card) {
      const savedCards = getSavedCards();
      // Check for duplicate card numbers
      const existingCard = savedCards.find(c => c.cardNumber === card.cardNumber);
      if (existingCard) {
        alert('Card with this number already exists!');
        return false; // Indicate that the card was not saved
      }
      savedCards.push(card);
      localStorage.setItem('registeredCards', JSON.stringify(savedCards));
      console.log("Card saved to localStorage:", card);
      return true; // Indicate that the card was saved
    }

    // Listen for messages from manual_card.html and auto_card.html
    window.addEventListener('message', function(event) {
      if (event.origin === window.location.origin) { // Check origin for security
        const message = event.data;
        if (message.type === 'registerCard') {
          const card = message.card;
          if (saveCardToLocalStorage(card)) {
            alert('Card registered successfully!');
          }
        }
      }
    });

// Ensure the color selector only works on the player card
const playerCard = document.getElementById('playerCard');
if (playerCard) {
    playerCard.addEventListener('click', function(e) {
        const cell = e.target;
        if (cell.tagName === 'TD' && cell.textContent !== 'F') { // Check if not "F"
            cell.style.backgroundColor = game.selectedColor;
            cell.textContent = ''; // Remove any existing text
        }
    });
}

const displayedCard = document.querySelector('.displayed-card');
if (displayedCard) {
    displayedCard.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent color selector from marking the displayed card
    });
}
