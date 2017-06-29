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

$(document).ready(function () {

        function init() {
            currTime = 30;
            numOfQuestions = 0;
            numberOfRightAnswers = 0;
            numberOfWrongAnswers = 0;

            for (let prop in categories) {
                $("#gameText").text("Pick a category!");
                $(".gameContainer").append($("<button>").text(prop).addClass("linedButton category").val(categories[prop]).click(function () {
                    initGame($(this).val());
                }));
            }
        }

        function initGame(category) {
            $(".mainTextHolder").append($("<div>").text("Question: "), $("<div>").text("Time remaining: "), $("<div>").text("Score: "));
            $("#gameText").text("");
            $(".category").remove();

            $.get("https://opentdb.com/api.php?amount=10&category=" + category, function(response){
                console.log("Success. Retrieved ", response);
            })
                .done(function(response){
                    currQuestions = response.results;
                    runTrivia();
                })
                .fail(function(response){
                    console.log("Error ", response.response_code);
                })
        }

        //function fetchQuestions(category) {
            // let request = new Request("https://opentdb.com/api.php?amount=10&category=18");
            //
            // fetch(request).then(function(response){
            //     return response.json();
            // }).then(function(response){
            //     currQuestions = response.results;
            //     console.log(currQuestions);
            //     //runTrivia();
            // }).catch(function(err){
            //     console.log("Fetch Error", err);
            // });
        //}

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

        function displayQuestion(question) {
            $(".question, .answers").remove();
            let currQuestion = parseHTML(question["question"]);
            let incorrectAnswers = parseAnswers(question["incorrect_answers"]);
            correctAnswer = parseHTML(question["correct_answer"]);
            let answers = incorrectAnswers.slice(0);
            answers.push(correctAnswer);

            $(questionDiv).prepend($("<div>").text(currQuestion).addClass("question"));

            for (let i = 0; i < answers.length; i++) {
                $(answersDiv).append($("<button>").text(parseHTML(answers[i])).addClass("answers linedButton").val(answers[i]));
            }

            $(".answers").click(function (event) {
                checkAnswer(event.target.value);
            });
        }

        function checkAnswer(userValue) {
            console.log(userValue);
            if (userValue === correctAnswer) {
                console.log("correct answer");
                numberOfRightAnswers++;
            } else if (userValue === "timeout") {
                console.log("time out");
                numberOfWrongAnswers++;
            } else {
                console.log("incorrect answer");
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
            $("#gameText").html($("<div>").addClass("final").text("Final score: " + numberOfRightAnswers + "  out of " + (numOfQuestions)))
        }

        //fetchQuestions();
        init();
    }
);




