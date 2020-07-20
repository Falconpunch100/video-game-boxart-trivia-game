var APIkey = "a560f7eadd544b97f2cf3e35a39e2daf"
var requestURL = "https://api-v3.igdb.com/games/"
var accessURL = "https://cors-anywhere.herokuapp.com/"
var mugshots = "https://api-v3.igdb.com/character_mug_shots"
var covers = "https://api-v3.igdb.com/covers"
var gameArray = []

const scorethreshold = 0.05

function createOptions() {
    var pizza = {
        method: "POST",
        headers: {
            "user-key": "a560f7eadd544b97f2cf3e35a39e2daf",
            Accept: "application/json"
        }
        ,
        body: "fields name,cover,platforms,url; where id = (" + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + ");"
    }
    return pizza;
}

async function grabGames() {
    var options = createOptions()
    var names = []
    var ids = []
    while (names.length < 10) {
        options = createOptions()
        var response = await fetch(accessURL + requestURL, options)
        var data = await response.json()
        for (var i = 0; i < data.length; i++) {
            var element = data[i]
            if (element.cover !== undefined && element.platforms !== undefined) {
                ids.push(element.cover)
                names.push({
                    name: element.name,
                    platforms: element.platforms,
                    gameid: element.id,
                    coverid: element.cover
                })
            }
        }
    }
    names.length = 10
    ids.length = 10
    getBoxart(ids, names)
}
grabGames()

async function getBoxart(ids, names) {
    var idList = ids.join(",");
    var bodyString = "fields *; where id = (" + idList + ");"
    var pizza = {
        method: "POST",
        headers: {
            "user-key": "a560f7eadd544b97f2cf3e35a39e2daf",
            Accept: "application/json"
        }
        ,
        body: bodyString
    }
    var response = await fetch(accessURL + covers, pizza)
    var data = await response.json()
    for (var i = 0; i < data.length; i++) {
        var element = data[i];
        element.url = imageSize(element.url)
    }
    combineInfo(data, names)
}

function imageSize(imgurl) {
    var newimgurl = imgurl.replace("t_thumb", "t_screenshot_med")
    if (imgurl !== undefined) {
        return newimgurl
    }
}

function getRandomGameNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function combineInfo(covers, names) {
    var combine = []
    for (var i = 0; i < covers.length; i++) {
        var element1 = covers[i];
        for (var j = 0; j < names.length; j++) {
            var element2 = names[j];
            if (element1.game === element2.gameid) {
                combine.push({ name: element2.name, cover: element1.url, platforms: element2.platforms})
            }
        }
    }
    gameArray = Array.from(combine)
    convertPlatformIDs()
    renderGames(combine)
}

function renderGames(combined) {
    var gamecontainer = document.getElementById("gamecontainer")
    var htmlstring = "";
    for (var i = 0; i < combined.length; i++) {
        var element = combined[i];
        htmlstring += `<section class="gamequiz animate__animated animate__zoomInUp">
        <div class="gamecover">
            <img src="https://${element.cover}" alt="">
        </div>
        <form>
            <input type="text" placeholder="Enter your answer here" class="useranswer">
        </form>
        <div class="score"></div>
        <span class="answer"></span>
    </section>`
    }
    gamecontainer.innerHTML = htmlstring;
}

function getAnswers() {
    var userGuesses = []
    var inputArray = Array.from(document.getElementsByClassName("useranswer"))
    for (var i = 0; i < inputArray.length; i++) {
        var element = inputArray[i];
        var currentGuess = element.value
        userGuesses.push(currentGuess)
    }
    for (var i = 0; i < gameArray.length; i++) {
        var element = gameArray[i];
        element.answer = userGuesses[i]
    }
    compareAnswers()
}

document.getElementById("usersubmit").addEventListener("click", getAnswers)

function compareAnswers() {
    const options = {
        includeScore: true
    }

    for (let index = 0; index < gameArray.length; index++) {
        const fuse = new Fuse(gameArray[index].platforms, options)
        const element = gameArray[index];
        if (element.answer !== "") {
            const resultArr = fuse.search(element.answer)
            var answerIsCorrect = givePoints(resultArr)
            element.score = answerIsCorrect
        }
        else {
            element.score = 1;
        }
    }
    tallyUpScores()
}

//Will fuse similar platforms into one category, I.E. answering "Linux", "Microsoft Windows" or "PC" will all count as the correct answer.
function convertPlatformIDs() {
    for (var i = 0; i < gameArray.length; i++) {
        var element = gameArray[i];
        for (var j = 0; j < element.platforms.length; j++) {
            var currentPlatformID = element.platforms[j];
            for (var k = 0; k < consoles.length; k++) {
                var currentConsole = consoles[k];
                var altNames = currentConsole.id
                if (typeof altNames === "object") {
                    var found = altNames.findIndex(function (id) {
                        if (id === currentPlatformID) {
                            return true
                        }
                        else {
                            return false
                        }
                    });
                    if (found !== -1) {
                        element.platforms[j] = currentConsole.name
                    }
                }
                else if (currentPlatformID === currentConsole.id) {
                    element.platforms[j] = currentConsole.name
                }
            }
        }
    }
    removeDuplicates()
}

function removeDuplicates() {
    for (var i = 0; i < gameArray.length; i++) {
        var element = gameArray[i];
        var multiPlatform = new Set(element.platforms)
        var newPlatforms = [...multiPlatform]
        console.log(newPlatforms)
        element.platforms = newPlatforms
    }
}

function tallyUpScores() {
    var scoreArray = document.getElementsByClassName("score")
    var answerArray = document.getElementsByClassName("answer")
    var numberCorrect = 0
    for (var i = 0; i < scoreArray.length; i++) {
        var element1 = scoreArray[i];
        var element2 = gameArray[i];
        answerArray[i].textContent = "Answer: " + element2.platforms
        if (element2.score < scorethreshold) {
            element1.innerHTML = `<span class="right">✔</span>`
            numberCorrect++
        }
        else if (element2.score > 0.05 && element2.score < 1) {
            element1.innerHTML = `<span class="closeEnough">━</span>`
            numberCorrect += 0.5
        }
        else {
            element1.innerHTML = `<span class="wrong">✖</span>`
        }
    }
    var tally = numberCorrect + "/" + scoreArray.length
    document.getElementById("tally").textContent = tally
}

function givePoints(arr) {
    var lowestScore = 1000;
    for (var i = 0; i < arr.length; i++) {
        var element = arr[i];
        if (element.score < lowestScore) {
            lowestScore = element.score
        }
    }
    return lowestScore
}

function resetGame() {
    gameArray.length = 0
    grabGames()
    document.getElementById("tally").textContent = ""
}

document.getElementById("reset").addEventListener("click", resetGame)