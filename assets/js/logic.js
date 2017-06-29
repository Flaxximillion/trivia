let currQuestions;
let timeoutID;
let questionTimer;
let currTime;
let numOfQuestions;
let correctAnswer;
let numberOfRightAnswers;
let numberOfWrongAnswers;

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
    currTime = 30;
    numOfQuestions = 0;
    numberOfRightAnswers = 0;
    numberOfWrongAnswers = 0;
    $(".gameContainer").prepend($("<span>Pick a category!</span>").addClass("initialText"));

    for (let prop in categories) {
        $(".gameContainer").append($("<button>").text(prop).addClass("linedButton category").val(categories[prop]).click(function () {
            $(".category").animate({
                "animation": "fadeOutDown 3s ease",
            });
            difficulty($(this).val());
        }));
    }
}

function difficulty(category) {
    $(".category").remove();
    $(".initialText").text("Pick a difficulty!");

    for (let i = 0; i < difficulties.length; i++) {
        $(".gameContainer").append($("<button>").text(difficulties[i]).addClass("linedButton difficulty").val(difficulties[i]).click(function () {
            initGame(category, $(this).val());
        }));
    }
}

function initGame(category, difficulty) {
    $(".initialText").remove();
    $(".difficulty").remove();
    $(".mainTextHolder").append($("<div>").text("Question: "), $("<div>").text("Time remaining: "), $("<div>").text("Score: "));


    $.get("https://opentdb.com/api.php?amount=10&category=" + category + "&difficulty=" + difficulty, function (response) {
        console.log("Success. Retrieved ", response);
    })
        .done(function (response) {
            currQuestions = response.results;
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
        $(answersDiv).append($("<button>").text(parseHTML(answers[i])).addClass("answers linedButton").val(answers[i]));
    }

    $(".answers").click(function (event) {
        checkAnswer(event.target.value);
    });
}

function checkAnswer(userValue) {
    if (userValue === correctAnswer) {
        numberOfRightAnswers++;
    } else if (userValue === "timeout") {
        numberOfWrongAnswers++;
    } else {
        numberOfWrongAnswers++;
    }
    numOfQuestions++;
    clearInterval(timeoutID);
    clearInterval(questionTimer);
    currTime = 30;
    runTrivia();
}

function setGameText() {
    $("#questionIndexDisplay").text(" " + numOfQuestions + " out of 10");
    $("#score").text(" " + numberOfRightAnswers + "  out of " + (numOfQuestions));
}

function runTrivia() {
    setGameText();
    if (numOfQuestions < 10) {
        displayQuestion(currQuestions[numOfQuestions]);
        timeoutID = window.setTimeout(checkAnswer, 30000, "timeout");
        timer();
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
    $(".question, .answers").remove();
    $("#gameText").html($("<div>").addClass("final").text("Final score: " + numberOfRightAnswers + "  out of " + (numOfQuestions)));
    $("#gameText").append($("<button>").addClass("linedButton").text("Play again!").click(function () {
        init();
        $(this).remove();
    }));
}