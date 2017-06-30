let currQuestions;
let timeoutID;
let questionTimer;
let currTime;
let numOfQuestions;
let correctAnswer;
let numberOfRightAnswers;
let numberOfWrongAnswers;
let session;

let questionDiv = $("#question");
let answersDiv = $("#answers");

const categories = {
    "Science: Computers": 18,
    "Animals": 27,
    "Entertainment: Comics": 29,
    "Science: Gadgets": 30,
    "General Knowledge": 9,
    "Entertainment: Video Games": 15,
};

const difficulties = ["easy", "medium", "hard"];

$(document).ready(function () {
        init();
    }
);

function init() {
    $("body").effect("slide", {"direction": "left"}, 1000);
    $(".playAgain, .final").remove();
    currTime = 30;
    numOfQuestions = 0;
    numberOfRightAnswers = 0;
    numberOfWrongAnswers = 0;
    $(".gameContainer").prepend($("<span>Pick a category!</span>").addClass("initialText"));

    for (let prop in categories) {
        $(".gameContainer").append($("<button>").text(prop).addClass("linedButton category").val(categories[prop]).click(function () {
            $("body").effect("drop", {"direction": "right"}, 1000).promise().done(function () {
                difficulty($(this).val());
            })
        }));
    }

    $.get("https://opentdb.com/api_token.php?command=request", function (response) {
        session = response.token;
    })
}

function difficulty(category) {
    $(".category").remove();
    $(".initialText").text("Pick a difficulty!");
    $("body").effect("slide", {"direction": "left"}, 1000);
    for (let i = 0; i < difficulties.length; i++) {
        $(".gameContainer").append($("<button>").prop("type", "input").text(difficulties[i]).addClass("linedButton difficulty").val(difficulties[i]).click(function () {
            $("body").effect("drop", {"direction": "right"}, 1000).promise().done(function () {
                initGame(category, $(this).val());
            })
        }))
    }
}


function initGame(category, difficulty) {
    $(".initialText, .difficulty").remove();


    $.get("https://opentdb.com/api.php?amount=10&category=" + category + "&difficulty=" + difficulty + "&token=" + session, function (response) {
        console.log("Success. Retrieved ", response);
    })
        .done(function (response) {
            currQuestions = response.results;
            $(".mainTextHolder").append($("<div>").text("Question: "), $("<div>").text("Time remaining: "), $("<div>").text("Score: "));
            runTrivia();
        })
        .fail(function (response) {
            console.log("Error ", response.response_code);
            initGame(category, difficulty);
        })
}

function parseAnswers(answers) {
    let returnArray = [];
    for (let i = 0; i < answers.length; i++) {
        returnArray.push(parseHTML(answers[i]));
    }
    return returnArray;
}

function parseHTML(HTML) {
    return $("<textarea/>").html(HTML).text();
}

function shuffleArray(array) {
    let n = array.length;
    let t;
    let i;

    while (n) {
        i = Math.random() * n-- | 0;
        t = array[n];
        array[n] = array[i];
        array[i] = t;
    }
    return array;
}

function displayQuestion(question) {
    $(".question, .answers").remove();
    let currQuestion = parseHTML(question["question"]);
    let incorrectAnswers = parseAnswers(question["incorrect_answers"]);
    correctAnswer = parseHTML(question["correct_answer"]);
    let answers = incorrectAnswers.slice(0);
    answers.push(correctAnswer);
    answers = shuffleArray(answers);

    $(questionDiv).prepend($("<div>").text(currQuestion).addClass("question"));

    for (let i = 0; i < answers.length; i++) {
        $(answersDiv).append($("<button>").text(parseHTML(answers[i])).prop("type", "input").addClass("answers linedButton").val(answers[i]));
    }

    $(".answers").click(function (event) {
        checkAnswer(event.target.value);
    });
}

function checkAnswer(userValue) {
    let value = "[value=" + $.escapeSelector(correctAnswer) + "]";
    console.log(value);
    ($(value)).css("box-shadow", "inset 0px 0px 5px 10px rgba(0,255,68,1)");

    $(".answers").prop("disabled", true);

    clearInterval(timeoutID);
    clearInterval(questionTimer);

    if (userValue === correctAnswer) {
        numberOfRightAnswers++;
    } else if (userValue === "timeout") {
        numberOfWrongAnswers++;
    } else {
        numberOfWrongAnswers++;
    }
    setTimeout(function () {
        $("body").effect("drop", {"direction": "right"}, 500).promise().done(function () {
            numOfQuestions++;
            currTime = 30;
            runTrivia();
        });
    }, 500);
}

function setGameText() {
    $("#questionIndexDisplay").text(" " + numOfQuestions + " out of 10");
    $("#score").text(" " + numberOfRightAnswers + "  out of " + (numOfQuestions));
}

function runTrivia() {

    if (numOfQuestions < 10) {
        setGameText();
        displayQuestion(currQuestions[numOfQuestions]);
        $("body").effect("slide", {"direction": "left"}, 1000, function () {
            timeoutID = window.setTimeout(checkAnswer, 30000, "timeout");
            timer();
        });
    } else {
        gameEnd();
    }
}

function timer() {
    currTime--;
    $("#timer").text(" " + currTime);
    questionTimer = setTimeout(timer, 1000);
}

function gameEnd() {
    $("body").effect("slide", {"direction": "left"}, 1000);
    $(".question, .answers").remove();
    $("#gameText").html($("<div>").addClass("final").text("Final score: " + numberOfRightAnswers + "  out of " + (numOfQuestions)));
    $("#gameText").append($("<button>").addClass("linedButton playAgain").text("Play again!").click(function () {
        $("body").effect("slide", {"direction": "left"}, 1000, function () {
            init();
        });
    }));
}