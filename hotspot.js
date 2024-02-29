// Your client-side JavaScript code

// Debugging

var debuggingTools = [];
var enableDebugging = false;

if (enableDebugging) {
  // Create a button to toggle developer tools
  var toggleDebuggingTools = $("<button>");
  toggleDebuggingTools
    .addClass("toggleDebuggingTools")
    .text("Toggle Developer Tools")
    .appendTo(document.body)
    .on("click", function() {
      // Toggle the visibility of each debugging tool
      debuggingTools.forEach(function(tool) {
        tool.toggle();
      });
    });

  var toggleTitle = $("<button>")
    .addClass("toggleTitle")
    .text("toggle title")
    .appendTo(document.body)
    .toggle()
    .on("click", function() {
      summaryTitle.toggle();
    });

  // Push toggleTitle into the debuggingTools array
  debuggingTools.push(toggleTitle);

  var toggleText = $("<button>")
    .addClass("toggleText")
    .text("toggle text")
    .appendTo(document.body)
    .toggle()
    .on("click", function() {
      summaryText.toggle();
    });

  // Push toggleText into the debuggingTools array
  debuggingTools.push(toggleText);

  var togglePlayButton = $("<button>")
    .addClass("togglePlayButton")
    .text("toggle play")
    .appendTo(document.body)
    .toggle()
    .on("click", function() {
      $(".playButton").toggle();
    });

  // Push toggleLogo into the debuggingTools array
  debuggingTools.push(togglePlayButton);

  var toggleFeedbackButton = $("<button>")
    .addClass("toggleFeedbackButton")
    .text("toggle feedback")
    .appendTo(document.body)
    .toggle()
    .on("click", function() {
      feedbackTriggerButton.toggle();
    });

  // Push toggleLogo into the debuggingTools array
  debuggingTools.push(toggleFeedbackButton);
}

// Declare variables for elements
let buttons = [];

var crossmark = $("<img>")
  .addClass("crossmark")
  .attr("src", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Cross_red_circle.svg/768px-Cross_red_circle.svg.png")
  .attr("height", "15%");

var summaryTitle = $("<h1>")
  .addClass("summaryTitle")
  .text("Hot Spot!")
  .appendTo(document.body);

var summaryText = $("<p>")
  .addClass("summaryText")
  .html("Can you guess their nationality, based only on looks?")
  .appendTo(document.body);

// Create a textbox with a custom message
var customMessage = $("<div>")
  .addClass("customMessage")
  .text("Click here to provide feedback!");

var feedbackTriggerButton = $("<button>")
.addClass("feedbackTriggerButton")
.text("Feedback")
.appendTo(document.body)
.on("mouseover", function() {
  customMessage.appendTo(feedbackTriggerButton);
})
.on("mouseleave", function() {
  customMessage.detach();
})
.on("click", function() {
  CreateFeedbackSubmissionBox();
  feedbackTriggerButton.detach();
  customMessage.detach();
});

var currentImg = $(".currentImg");
var animating = false;
var noMoreData = false;
var feedbackSwitch = false;
var score = 0;
var scoreDisplay = $("<div>");
var firstCreation = true;
var globalCorrectButton;
var globalWrongButtons = [];

async function CreateButtons() {
  if (firstCreation) {
    firstCreation = false;
    
    for (let i = 1; i <= 4; i++) {
      buttons[i] = $("<button>")
        .addClass(`button button${i} newButton`)
        .css("transform", "scale(1.05)")
        .text(`Button ${i}`);
    }
  } else if (!firstCreation) {
    for (let i = 1; i <= 4; i++) {
      buttons[i] = $("<button>")
        .addClass(`button button${i} newButton`)
        .css("transform", "scale(1.05)")
        .text(`Button ${i}`);

        setTimeout(() => {
          buttons[i].css({
              "transform": "scale(1)",
              "transition": "transform 0.3s ease"
          });
      }, 100);
    }
  }
  
  // Append all buttons to the document body
  buttons.forEach(button => button.appendTo(document.body));
  
  // Fetch correctAnswer via 'REST' API
  const correctAnswer = await FetchAndDisplayRandomImage();

  // Fetch wrong answers via 'REST' API
  const wrongAnswersPromise = FetchRandomCountries(correctAnswer).then(wrongAnswers => {
    //console.log('Wrong Answers:', wrongAnswers);
    return wrongAnswers;
  });
  
  // Call the function to display random countries on the buttons
  DisplayRandomCountries(correctAnswer, wrongAnswersPromise);

  //console.log("globalCorrectButton:", globalCorrectButton);
  //console.log("globalWrongButtons:", globalWrongButtons);

  scoreDisplay
    .addClass("scoreDisplay")
    .text(score)
    .appendTo(document.body);
}

// Function to display the 'Play' button
function ShowPlayButton() {
  const playButton = document.createElement('button');
  playButton.innerText = 'Play';
  playButton.className = 'playButton';

  // Add click event listener to start the game
  playButton.addEventListener('click', StartGame);

  document.body.appendChild(playButton);
}

// Function to start the game
function StartGame() {
  // Remove the 'Play' button
  document.querySelector('.playButton').remove();

  // Detach minor elements
  feedbackTriggerButton.detach();
  summaryText.detach();
  summaryTitle.css({
    "font-size": "50px",
    "transition": "font-size 0.5s ease"
  });

  $("#globeContainer").css({
    "filter": "blur(4px)",
    "transition": "filter 1s ease"
  });

  // Call the function to generate and append the buttons
  CreateButtons();
}

// Function to fetch and display random country names and emoji flags
function DisplayRandomCountries(correctAnswer, wrongAnswers) {
  // Create randomIndex based on buttons[] array
  const randomIndex = Math.floor(Math.random() * (buttons.length - 1)) + 1;

  // Assign a variable to a randomly chosen button
  const correctAnswerButton = buttons[randomIndex];

  // Store wrongAnswerButtons as the remaining items in buttons[]
  const wrongAnswerButtons = buttons.filter(button => button !== correctAnswerButton);

  if (correctAnswerButton) {
    // Display correct answer on the randomly chosen button
    correctAnswerButton.text(correctAnswer);
  }

  // Wait for the wrongAnswers promise to resolve
  wrongAnswers.then(resolvedWrongAnswers => {
    for (let i = 0; i < wrongAnswerButtons.length; i++) {
      // Generate new text content for each button
      wrongAnswerButtons[i].text(resolvedWrongAnswers[i]);
    }
  });

  OrderButtons(correctAnswerButton, wrongAnswerButtons);
}

function OrderButtons(correctButton, wrongButtons) {
  globalCorrectButton = correctButton;
  globalWrongButtons = wrongButtons;

  // Attach click event handler to the correct button
  $(globalCorrectButton).on("click", CorrectAnswer);

  // Attach click event handler to each wrong button
  globalWrongButtons.forEach(button => {
    $(button).on("click", WrongAnswer);
  });
}

// Function to get random countries from a custom list
function FetchRandomCountries(correctAnswer) {
  try {
    // Your custom list of countries
    const customCountries = [
      "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Bahamas", "Belarus",
      "Belgium", "Bolivia", "Brazil", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia",
      "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Ecuador", "Egypt", "Estonia", "Ethiopia",
      "Fiji", "Finland", "France", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Haiti", "Hungary", "Iceland",
      "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Kenya", "Laos", "Latvia",
      "Lithuania", "Luxembourg", "Madagascar", "Malaysia", "Maldives", "Malta", "Mexico", "Mongolia", "Morocco", "Nepal",
      "Netherlands", "New Zealand", "Norway", "Pakistan", "Panama", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
      "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea",
      "Spain", "Sri Lanka", "Sweden", "Switzerland", "Syria", "Thailand", "Tunisia", "Turkey", "Uganda", "Ukraine",
      "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam"
    ];

    // Remove the correct answer from the list of all countries
    const filteredCountries = customCountries.filter(country => country !== correctAnswer);

    // Shuffle the array of remaining countries
    const shuffledCountries = filteredCountries.sort(() => Math.random() - 0.5);

    // Take the first 3 countries from the shuffled array as potential wrong answers
    const wrongAnswers = shuffledCountries.slice(0, 3);

    // Return the array of wrong answers as a Promise
    return Promise.resolve(wrongAnswers);
  } catch (error) {
    // Handle errors, log to the console, and return an empty array
    console.error('Error fetching random countries:', error);
    return Promise.resolve([]);
  }
}

// Event listeners for button hover effects
function ApplyButtonHoverEffects() {
  if (!animating) {
    $(".currentImg").css({
      "transform": "translate(-50%, -50%) scale(1.05)",
      "box-shadow": "0 0 40px 50px rgba(0, 0, 0, 0.7)"
    });
    $(".button1, .button3").css({
      "transform": "translate(-2.9%, 13%) scale(1.0575)",
      "transition": "transform 0.3s ease"
    });
    $(".button2, .button4").css({
      "transform": "translate(2.9%, 13%) scale(1.0575)",
      "transition": "transform 0.3s ease"
    });
  }
}

// Event listeners for button mouse leave effects
function ApplyButtonMouseLeaveEffects() {
  if (!animating) {
    $(".currentImg").css({
      "transform": "translate(-50%, -50%) scale(1)",
      "box-shadow": "0 0 30px 40px rgba(0, 0, 0, 0.5)"
    });
    buttons.forEach(button => {
      button.css({
        "transform": "scale(1)",
        "transition": "transform 0.3s ease"
      });
    });
  }
}

// Use event delegation for button hover effects
$(document).on('mouseenter', '.button', ApplyButtonHoverEffects);
$(document).on('mouseleave', '.button', ApplyButtonMouseLeaveEffects);

// Use event delegation for .currentImg hover effects
$(document).on('mouseenter', '.currentImg', ApplyButtonHoverEffects);
$(document).on('mouseleave', '.currentImg', ApplyButtonMouseLeaveEffects);


function ApplyCheckmarkAnimation() {
  var checkmark = $("<img>")
    .addClass("checkmark")
    .attr("src", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Eo_circle_green_white_checkmark.svg/480px-Eo_circle_green_white_checkmark.svg.png")
    .attr("height", "15%");

  checkmark.appendTo(document.body);
  checkmark[0].offsetHeight;
  checkmark.css({
      "transform": "scale(1) rotate(-45deg) translate(850%, -250%)",
      "opacity": "100%",
      "transition": "transform 2.5s ease, opacity 1s ease"
  });

  setTimeout(function() {
    checkmark.remove();
  }, 2600);
}

function CorrectAnswer() {
  score++;

  if (!noMoreData) {
    const currentImg = $(".currentImg");

    // Remove the 'currentImg' class and add the 'exiting' class
    currentImg.removeClass('currentImg').addClass('exiting');
    const exiting = $(".exiting");
  
    exiting.css({
        "transform": "rotate(-45deg) translate(300%, -100%)",
        "border": "3px solid green",
        "transition": "transform 3s ease, border 0.75s ease"
    });
  
    ApplyCheckmarkAnimation();
  
    setTimeout(function() {
      exiting.remove();
      animating = false;
    }, 2000);
  
    buttons.forEach(button => {
      setTimeout(() => {
        button.css({
            "transform": "scale(1)",
            "transition": "transform 0.3s ease"
        });
      }, 10);
    });

    buttons.forEach(button => button.css("z-index", "10"));
    buttons.forEach(button => button.addClass("oldButton"));

    CreateButtons();

    setTimeout(function() {
      $(".oldButton").remove()
    }, 500);

    $(".newButton").css({
      "background-color": "green",
      "transition": "background-color 0.5s ease"
  });

  setTimeout(function() {
      $(".newButton").css({
          "background-color": "#feb30a",
          "transition": "background-color 0.5s ease"
      });
  }, 250);

  setTimeout(function() {
      $(".newButton").css({
          "background-color": "",
          "transition": ""
      });
  }, 500);
  }
}

function WrongAnswer() {
  if (!noMoreData) {
    const currentImg = $(".currentImg");

    // Apply red background to button2
    $(".newButton").css({
      "background-color": "red",
      "transition": "background-color 0.5s ease"
    });

    // Reset button2 background color after a delay
    setTimeout(function() {
      $(".newButton").css({
        "background-color": "",
        "transition": ""
      });
    }, 500);

    // Display crossmark
    const crossmark = $("<div>")
      .addClass("crossmark")
      .appendTo(document.body);
    crossmark[0].offsetHeight; // Force reflow
    crossmark.css({
      "transform": "scale(1) rotate(-45deg) translate(-1000%, 0%)",
      "opacity": "100%",
      "transition": "transform 2.5s ease, opacity 1s ease"
    });

    // Transform currentImg and add border
    currentImg.css({
      "transform": "rotate(-45deg) translate(-600%, -0%)",
      "border": "3px solid red",
      "transition": "transform 4s ease, border 0.75s ease"
    });

    // Transform buttons and make them transparent
    $(".button").css({
      "transform": "rotate(-45deg) translate(-600%, 0%)",
      "opacity": "0%",
      "transition": "transform 3s ease, opacity 1s ease"
    });

    // Display flashRed
    const flashRed = $("<div>")
      .addClass("flash")
      .appendTo(document.body);

    // Flash red background and initiate GameOver
    setTimeout(function () {
      flashRed.css({
        "background-color": "red",
        "transition": "background-color 0.5s ease"
      });
      GameOver();
    }, 0);

    // Reset flashRed background color after a delay
    setTimeout(function () {
      flashRed.css({
        "background-color": "transparent",
        "transition": "background-color 0.5s ease"
      });
    }, 500);

    setTimeout(function() {
      buttons = [];
      flashRed.remove();

      //console.log(buttons);
    }, 1000);

    // Remove currentImg and finish animation
    setTimeout(function() {
      currentImg.remove();
      animating = false;
    }, 3000);

    scoreDisplay.remove();
  }
}

function GameOver() {
  // Ensure there are fetched images
  if (images.length > 0) {
    // Clone the original images array to avoid modifying the original
    const allImages = [...images];

    // Randomize array
    const randomizedImages = allImages.sort(() => Math.random() - 0.5);

    // Get the total number of items in the array
    const totalItems = randomizedImages.length;

    // Calculate the base size of each group
    const groupSize = Math.floor(totalItems / 4);

    // Calculate the remainder when dividing the total items by 4
    const remainder = totalItems % 4;

    // Initialize variables to track the start index for each group
    let startIndex = 0;
    let endIndex = 0;

    // Split the array into four groups, adjusting sizes based on the remainder
    const group1 = getNextGroup(groupSize + (remainder > 0 ? 1 : 0));
    const group2 = getNextGroup(groupSize + (remainder > 1 ? 1 : 0));
    const group3 = getNextGroup(groupSize + (remainder > 2 ? 1 : 0));
    const group4 = getNextGroup(groupSize);

    // Log the size of each group
    //console.log('Group 1:', group1.length);
    //console.log('Group 2:', group2.length);
    //console.log('Group 3:', group3.length);
    //console.log('Group 4:', group4.length);

    // Function to get the next group from the array
    function getNextGroup(size) {
      const group = allImages.slice(startIndex, startIndex + size);
      startIndex += size;
      return group;
    }

    // Create a container for each group
    CreateGroupContainer(group1, 'firstSliderContainer', '25vw', 'down');
    CreateGroupContainer(group2, 'secondSliderContainer', '25vw', 'up');
    CreateGroupContainer(group3, 'thirdSliderContainer', '25vw', 'down');
    CreateGroupContainer(group4, 'fourthSliderContainer', '25vw', 'up');
    
    var gameOverText = $("<p>");
    var scoreNum = $("<p>");
    var scoreText = $("<h3>");
    var container = $("<div>");

    container
      .addClass("container")
      .appendTo(document.body)
      .animate({
        opacity: "90%",
      }, 1000, function() {
        // Animation complete
      });

    gameOverText
      .addClass("gameOverText")
      .text("Game Over!")
      .appendTo(document.body)
      .animate({
        opacity: "100%",
      }, 1000, function() {
        // Animation complete
      });

    scoreNum
      .addClass("scoreNum")
      .text(score)
      .appendTo(document.body)
      .animate({
        opacity: "100%",
      }, 1000, function() {
        // Animation complete
      });

    scoreText
      .addClass("scoreText")
      .text("You scored:")
      .appendTo(document.body)
      .animate({
        opacity: "100%",
      }, 1000, function() {
        // Animation complete
      });

    feedbackTriggerButton
      .css({"top": "22.5%", "opacity": "0%"})
      .appendTo(document.body)
      .animate({
        opacity: "100%",
      }, 1000, function() {
        // Animation complete
      });

    feedbackSwitch = true;

    setTimeout(function() {
      summaryTitle.animate({
        opacity: "0%",
      }, 300, function() {
        // Animation complete
      });
    }, 250);

    ShowPlayAgainButton();
    CreateShareButtons();
      

  } else {
    //console.log('No images available.');
  }
}

function CreateShareButtons() {
  const shareContainer = $('#shareContainer');

  // Format the tweet message
  const tweetMessage = `Lost to her! 😔 Can you guess her nationality? 🌍 Scored ${score} in the Hot Spot challenge! 🔥 #HotSpotChallenge`;

  // Encode the tweet message for URL
  const encodedTweetMessage = encodeURIComponent(tweetMessage);

  // Update the Twitter share button URL with the encoded tweet message and image
  const twitterURL = `https://twitter.com/intent/tweet?text=${encodedTweetMessage}&url=${encodeURIComponent('www.hotspot.games')}`;
  const twitterButton = CreateShareButton(
    'Share',
    twitterURL,
    'twitterButton',
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="26" height="26"><path d="M23 4.99998C22 5.49998 20.9 5.89998 19.7 6.09998C20.9 5.49998 21.9 4.59998 22.3 3.49998C21.3 4.09998 20.2 4.49998 19 4.69998C18 3.69998 16.7 3.19998 15.3 3.19998C12.6 3.19998 10.3 5.49998 10.3 7.99998C10.3 8.39998 10.4 8.79998 10.6 9.09998C7.79996 8.89998 5.29996 7.59998 3.59996 5.39998C2.89996 6.49998 2.49996 7.89998 2.49996 9.39998C2.49996 11.6 3.79996 13.6 5.79996 14.2C5.19996 14.4 4.59996 14.5 3.99996 14.5C3.59996 14.5 3.19996 14.5 2.79996 14.4C3.59996 16 5.09996 17.2 6.89996 17.5C6.49996 17.6 6.09996 17.6 5.69996 17.6C5.39996 17.6 5.09996 17.6 4.79996 17.5C5.39996 19.1 6.99996 20.2 8.79996 20.2C7.29996 21.3 5.49996 21.9 3.59996 21.9C3.19996 21.9 2.79996 21.9 2.39996 21.8C4.19996 22.9 6.19996 23.5 8.29996 23.5C15.3 23.5 19.7 15 19.7 8.09998C19.7 7.79998 19.7 7.49998 19.6 7.19998C20.7 6.49998 21.7 5.69998 23 4.99998Z" fill="white"/></svg>'
  );
  
  shareContainer.append(twitterButton);

  twitterButton.animate({
    opacity: "100%"
  }, 1000, function() {
    // Animation complete
  });
}

function CreateShareButton(text, url, buttonClass, iconHtml) {
  const button = $('<button></button>');
  button.html(`${iconHtml}<span class="buttonIcon"></span>${text}`);
  button.addClass(`shareButton ${buttonClass}`);
  button.on('click', function() {
    window.open(url, '_blank', 'noopener noreferrer');
  });

  return button;
}

// Function to create a feedback submission box/button
function CreateFeedbackSubmissionBox() {
  if (!feedbackSwitch) {
    // Create a container for the feedback form
    var feedbackContainer = $("<div>")
      .addClass("feedbackContainer")
      .appendTo(document.body);

    // Create a textarea for feedback input
    var feedbackTextarea = $("<textarea>")
      .addClass("feedbackTextarea")
      .attr("placeholder", "Enter your feedback here...")
      .appendTo(feedbackContainer);

    // Create a submit button for feedback
    var feedbackSubmitButton = $("<button>")
      .addClass("feedbackSubmitButton")
      .text("Submit Feedback")
      .on("click", function () {
        // Get the feedback text from the textarea
        var feedbackText = feedbackTextarea.val();
        sendEmail(feedbackText);

        // TODO: Send the feedback to your server or perform any desired action
        //console.log("Feedback submitted:", feedbackText);

        // Optionally, clear the textarea after submission
        feedbackTextarea.val("");
      })
      .appendTo(feedbackContainer);

    // Create a cancel button for feedback
    var feedbackCancelButton = $("<button>")
    .addClass("feedbackCancelButton")
    .text("Cancel")
    .on("click", function () {
      feedbackSubmitButton.detach();
      feedbackTextarea.detach();
      feedbackCancelButton.detach();

      feedbackTriggerButton.appendTo(document.body);
    })
    .appendTo(feedbackContainer);
  } else if (feedbackSwitch) {
      // Create a container for the feedback form
      var feedbackContainer = $("<div>")
        .addClass("feedbackContainer-alt")
        .appendTo(document.body);
  
      // Create a textarea for feedback input
      var feedbackTextarea = $("<textarea>")
        .addClass("feedbackTextarea")
        .attr("placeholder", "Enter your feedback here...")
        .appendTo(feedbackContainer);
  
      // Create a submit button for feedback
      var feedbackSubmitButton = $("<button>")
        .addClass("feedbackSubmitButton")
        .text("Submit Feedback")
        .on("click", function () {
          // Get the feedback text from the textarea
          var feedbackText = feedbackTextarea.val();
          sendEmail(feedbackText);
  
          // TODO: Send the feedback to your server or perform any desired action
          console.log("Feedback submitted:", feedbackText);
  
          // Optionally, clear the textarea after submission
          feedbackTextarea.val("");
        })
        .appendTo(feedbackContainer);

      // Create a cancel button for feedback
      var feedbackCancelButton = $("<button>")
      .addClass("feedbackCancelButton")
      .text("Cancel")
      .on("click", function () {
        feedbackSubmitButton.detach();
        feedbackTextarea.detach();
        feedbackCancelButton.detach();
  
        feedbackTriggerButton.appendTo(document.body);
      })
      .appendTo(feedbackContainer);
  }
}

emailjs.init("VbQL2yJ_YSB_E4ARB"); // Replace with your EmailJS user ID

function sendEmail(emailContent) {
  // Check if the email content is not empty
  if (emailContent.trim() === "") {
    alert("Please enter content before submitting.");
    return;
  }

  // You need to create a template and get the template ID from EmailJS
  const templateParams = {
    to_email: "hotspot.replies@gmail.com", // Replace with the recipient's email address
    message: emailContent,
  };

  emailjs.send("service_590btg8", "template_00lj9ak", templateParams)
    .then(function(response) {
        console.log("Email sent successfully:", response);
        alert("Feedback delivered!");
    }, function(error) {
        console.error("Email failed to send:", error);
        alert("Failed to send feedback, try again later.");
    });
}

// Function to create a container for a group and append images
function CreateGroupContainer(group, containerClass, columnWidth, slideDirection) {
  if (group.length > 0) {
    // Create a container to hold the images
    const container = $("<div>").addClass(containerClass);
    container.addClass("sliders");
    
    // Add the appropriate direction class to the container
    container.addClass(`container-${slideDirection}`);
    
    container.appendTo(document.body);

    // Initialize totalHeight to 0
    let totalHeight = 0;

    // Loop through each image in the group
    group.forEach((imageUrl, index) => {
      // Create an <img> element
      const imgElement = $("<img>")
        .attr("src", imageUrl)
        .addClass('group-image')
        .css("width", columnWidth) // Set width to the specified column width
        .appendTo(container); // Append the <img> element to the container

      // Get the actual height of the image and add it to totalHeight
      totalHeight += imgElement.height();
    });

    // Adjust the container's position to align its bottom with the bottom of the window
    if (slideDirection === 'down') {
      const bottomPosition = $(window).height() - totalHeight;
      container.css('top', `${bottomPosition}px`);
    }
  } else {
    //console.log(`No images in ${containerClass}.`);
  }
}

function ShowPlayAgainButton() {
  const playAgainButton = $("<button>")
    .addClass("playAgainButton")
    .text("Play Again")
    .appendTo(document.body)
    .on("click", PlayAgain);
}

function PlayAgain() {
  score = 0; // Reset score
  mirrorArray = [...mappedData];
  summaryTitle
    .css("opacity", "100%")
    .appendTo(document.body); // Append title back to page
  
  // Remove Game Over elements
  $(".container, .gameOverText, .scoreNum, .scoreText").detach();
  $(".sliders").remove();
  $(".shareButton, .twitterButton, .buttonIcon").remove();
  feedbackTriggerButton.detach();

  firstCreation = true;
  scoreDisplay.appendTo(document.body);

  // Generate buttons again
  CreateButtons();
}

// Event listener for button clicks (delegated to document.body)
$(document.body).on("click", ".button", function() {
  animating = true;
});

//===============================================================>

          // <==================================> //
          // ||                                || //
          // || [Data Reqeust] Client 2 Server || //
          // ||                                || //
          // <==================================> //
          //                 VVVV

let data; // Declare a variable to store the fetched data
let images = []; // Declare an array to store all image URLs
let answers = []; // Declare an array to store all answers
let mirrorArray = []; // Create a mirror array to images[]
let mappedData = [];

// Fetch data from the server when the page is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    //const response = await fetch('/data');
    const response = await fetch('data.json');
    const responseData = await response.json();

    if (responseData.success) {
      data = responseData.data;

      // Map each row to an object containing both the original data and the extracted values
      mappedData = data.map((row, index) => {
        return {
          originalData: row,
          image: row.column2,
          answer: row.column3,
          rowNumber: index + 1, // Incremental number value representing the row
        };
      });
      
      // Extract images and answers separately from the mapped data
      images = mappedData.map(item => item.image);
      answers = mappedData.map(item => item.answer);
      
      // Create a mirrorArray with the mapped data
      mirrorArray = [...mappedData];

      // Append all images with the 'awaiting' class
      images.forEach(imageUrl => {
        const imgElement = $("<img>")
          .attr("src", imageUrl)
          .addClass('awaiting');
          
        document.body.appendChild(imgElement[0]);
      });

      //console.log("images:", images);
      //console.log("answers:", answers);

      ShowPlayButton();
    } else {
      console.error('Error fetching data:', responseData.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Function to fetch and display a random image
async function FetchAndDisplayRandomImage() {
  let correctAnswer;

  if (mirrorArray.length > 0) {
    // Get a random index to select a random item from the copy
    const randomIndex = Math.floor(Math.random() * mirrorArray.length);

    // Get the random item from mirrorArray
    const randomItem = mirrorArray[randomIndex];

    // Get the image URL from the random item
    const imageUrl = randomItem.image;

    // Get the corresponding row from the random item
    const correspondingRow = randomItem.rowNumber;

    // Use the corresponding row to get the correct answer from the answers array
    correctAnswer = answers[correspondingRow - 1];

    // Remove the displayed item from the copy
    mirrorArray.splice(randomIndex, 1);

    // Create an <img> element
    const imgElement = document.createElement('img');

    // Set attributes for the <img> element
    imgElement.src = imageUrl;
    imgElement.className = 'currentImg'; // Add the class

    // Append the <img> element to the body or another desired container
    document.body.appendChild(imgElement);

    //console.log('Random Image URL:', imageUrl);
    //console.log('Corresponding Row:', correspondingRow);
    //console.log('Correct Answer:', correctAnswer);
  } else {
    //console.log('No more images available.');
    noMoreData = true;
  }

  return correctAnswer;
}

// 3D Globe Animation

import * as THREE from 'https://threejs.org/build/three.module.js';
//import { OrbitControls } from '../modules/OrbitControls.js';

// Set up scene
const scene = new THREE.Scene();

// Set up camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Set up renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('globeContainer').appendChild(renderer.domElement);

// Create OrbitControls
/*const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;*/

// Control variables
let rotationSpeedX = 0.001;
let rotationSpeedY = 0.002;
let globeSize = 3;

// Create a sphere (globe)
const geometry = new THREE.SphereGeometry(globeSize, 256, 256);
const material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('/texture_2_logo.png'), transparent: true });
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

const animate = function () {
  requestAnimationFrame(animate);

  // Add rotation to the globe based on control variables
  //globe.rotation.x += rotationSpeedX;
  globe.rotation.y += rotationSpeedY;

  //controls.update(); // Update controls during animation

  renderer.render(scene, camera);
};

// Run animation
animate();