var APIkey = "a560f7eadd544b97f2cf3e35a39e2daf"
var requestURL = "https://api-v3.igdb.com/games/"
var accessURL = "https://cors-anywhere.herokuapp.com/"
//var mugshots = "https://api-v3.igdb.com/character_mug_shots"
var covers = "https://api-v3.igdb.com/covers"
var gameArray = []
const scorethreshold = 0.05

async function grabGames() {
    var pizza = {
        method: "POST",
        headers: {
            "user-key": "a560f7eadd544b97f2cf3e35a39e2daf",
            Accept: "application/json"
        }
        ,
        body: "fields name,cover; where id = (" + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + "," + getRandomGameNumber(0, 100000) + ");"
    }
    var response = await fetch(accessURL + requestURL, pizza)
    var data = await response.json()
    //name: key
    var names = []
    var ids = []
    for (var i = 0; i < data.length; i++) {
        var element = data[i];
        if (element.cover !== undefined) {
            ids.push(element.cover)
            names.push({ name: element.name, gameid: element.id })
        }
    }
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

// async function charMugshot() {
//     var pizza = {
//         method: "POST",
//         headers: {
//             "user-key": "a560f7eadd544b97f2cf3e35a39e2daf",
//             Accept: "application/json"
//         }
//         ,
//         body: "fields alpha_channel,animated,checksum,height,image_id,url,width;"
//     }
//     var response = await fetch(accessURL + mugshots, pizza)
//     var data = await response.json()

// }

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
                combine.push({ name: element2, cover: element1.url })
            }
        }
    }
    gameArray = Array.from(combine)
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
        includeScore: true,
        keys: ['name.name'],
    }
    const fuse = new Fuse(gameArray, options)
    for (let index = 0; index < gameArray.length; index++) {
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

function tallyUpScores() {
    var scoreArray = document.getElementsByClassName("score")
    var numberCorrect = 0
    for (var i = 0; i < scoreArray.length; i++) {
        var element1 = scoreArray[i];
        var element2 = gameArray[i];
        if (element2.score < scorethreshold) {
            element1.innerHTML = `<span class="right">✔</span>`
            numberCorrect++
        }
        else if (element2.score > 0.05 && element2.score < 1) {
            element1.innerHTML = `<span class="closeEnough">━</span>`
            numberCorrect+= 0.5
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