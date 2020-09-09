var randomize = require('randomatic');
var crypto = require('crypto');
const {
    promisify
} = require("util");
const path = require("path");

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))


// SessionID generator
const serialize = obj =>
    Object.entries(obj).map(([k, v]) => `${k}=${v}`).join(';')


// Count how many users are in WDF by counting the JSON number (tmp included, if you need the exact number, do - 1)
const currentPlayerCount = fs.readdirSync('./tmp/userdb/').length


app.post("/ConstantProvider/getConstants", (req, res) => {
    res.send({
        "JDWall_Service": {
            "FriendsUGC": {
                "refresh_time": 120,
                "max_msg": 5
            }
        }
    });
});

app.post("/DancerCard/UploadDancerProfile", (req, res) => {
    res.send("");
});

app.post("/StarChallenge/getCommonData", (req, res) => {
    res.send("");
});

app.post("/Mashup/getCurrentMap", (req, res) => {
    res.send("mapName=NoMap&version=0&url=");
});

app.post("/Mashup/getMetadata", (req, res) => {
    res.send("");
});


// Time Format
const finaltime = String(Date.now()).slice(0, 9) + "." + String(Date.now()).slice(8, 31)

app.post("/wdfjd6", (req, res, next) => {

    // CheckToken - DONE
    if (req.query.d === 'checkToken') {
        res.send("method_id=1023;stat=1");
    }
    // GetServerTime - DONE
    if (req.query.d === 'getServerTime') {
        res.send(serialize({
            "method_id": 1350,
            "t": finaltime,
            sendscore_interval: 5,
            stat: 1
        }));
    }

    // ConnectToWDF - DONE
    if (req.query.d === 'connectToWDF') {
        var method_id = "method_id=1166;"
        let string = Math.floor(100000 + Math.random() * 900000000);
        var loginObj = {};

        loginObj = {
            sessionid: string,
            avatar: req.body.avatar,
            name: req.body.name,
            onlinescore: req.body.onlinescore,
            pays: "8758"
        }

        res.send(method_id + "sid=" + string + ";players_in_country=0;t=" + finaltime + ";stat=1");

        var json = JSON.stringify(loginObj);
        fs.writeFileSync("./tmp/userdb/" + string + '.json', json, 'utf8');
        console.log("User connected to WDF: " + string + '.json' + " created. " + "Username: " + req.body.name)
    }

    // DisconnectFromWDF - DONE
    if (req.query.d === 'disconnectFromWDF') {
        res.send("method_id=1695;stat=1")

        fs.unlink("./tmp/userdb/" + req.body.sid + '.json', function(err) {
            if (err) throw err;
        });
        console.log("User disconnected from WDF: " + req.body.sid + '.json' + " deleted.")

    }

    // This is for combining everyone's info and sending it as a response for getRandomPlayers etc. without the current user's info.
    async function process(excludedSessionId) {
        try {
            const entries = [];

            // get a list of all `JSON` files
            const jsonFiles = await readdir(
                path.join(__dirname, "./tmp/userdb/")
            ).then(
                (files) => files.filter(
                    (file) => path.extname(file) === ".json" && !file.includes(excludedSessionId)
                )
            );

            // iterate through a list of all `JSON` files & read their content
            for (const [index, file] of jsonFiles.entries()) {
                const content = await readFile(
                    path.join(__dirname, "./tmp/userdb/", file)
                ).then(JSON.parse);

                // create an object for a new entry
                const key = `sid${index}`;
                const name = `name${index}`;
                const pays = `pays${index}`;
                const avatar = `avatar${index}`;
                const onlinescore = `onlinescore${index}`;
                const keyValue = Object.keys(content)[0];

                // use the `spread syntax` to include the rest of the
                // properties in a new entry 
                const entry = {
                    [key]: content.sessionid,
                    [name]: content.name,
                    [pays]: 8429,
                    [avatar]: content.avatar,
                    [onlinescore]: content.onlinescore,
                };
                entries.push(entry);
            }

            const result = entries.map((entry) => serialize(entry)).join(";");

            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    process();


    // getRandomPlayers - DONE
    if (req.query.d === 'getRandomPlayers') {

        var sessionid = req.body.player_sid
        let user = require("./tmp/userdb/" + sessionid + ".json")
        const excludedSessionId = req.body.player_sid

        var current_user = (serialize({
            player_name: user.name
        }));

        var WMapEnding = (serialize({
            nr_players: currentPlayerCount - 1,
            nr_asked: currentPlayerCount - 2,
            count: currentPlayerCount,
            stat: 1
        }))

        process(excludedSessionId)
            .then(result => {
                res.send("method_id=2038;" + current_user + result + ";" + WMapEnding);
            })
            .catch(error => {
                res.status(500).send("Something went wrong.");
            });
    }


    // getRandomPlayersWMap - DONE
    if (req.query.d === 'getRandomPlayersWMap') {

        var sessionid = req.body.player_sid
        let user = require("./tmp/userdb/" + sessionid + ".json")
        const excludedSessionId = req.body.player_sid

        var current_user = (serialize({
            player_name: user.name
        }));

        var WMapEnding = (serialize({
            nr_players: currentPlayerCount - 1,
            nr_asked: currentPlayerCount - 2,
            count: currentPlayerCount,
            stat: 1
        }))

        process(excludedSessionId)
            .then(result => {
                res.send("method_id=12038;" + current_user + result + ";" + WMapEnding);
            })
            .catch(error => {
                res.status(500).send("Something went wrong.");
            });
    }

    // getPlayListPos - Halfly Done
    if (req.query.d === 'getPlayListPos') {

        let data = serialize(({
            method_id: 1444,
            mode: 3,
            nextmode: 3,
            start: 586377772.367,
            end: 586377980.603,
            unique_song_id: 8658227481664,
            sessionToWorldResultTime: 30,
            display_next_song_time: 10,
            session_recap_time: 20,
            theme_choice_duration: 0,
            theme_result_duration: 15,
            coach_choice_duration: 15,
            coach_result_duration: 15,
            vote1: 0,
            vote2: 0,
            vote3: 0,
            vote4: 0,
            votenumresult: 0,
            vote1_song: 0,
            vote2_song: 0,
            vote3_song: 0,
            vote4_song: 0,
            rankwait: 2,
            nextsong: 0,
            votenumchoices: 3,
            vote_end: 586378062.603,
            requestPlaylistTime: 586378066.603,
            pos: -24.209,
            next1: 0,
            next2: 0,
            next3: 0,
            next4: 0,
            left: 232.445,
            interlude: "yes",
            count: currentPlayerCount - 1,
            t: 586377748.158,
            stat: 1
        }))
        res.send(data)
    };

    // getBloomBergs2 - Halfly Done
    if (req.query.d === 'getBloomBergs2') {
        let data = serialize({
            method_id: 1374,
            country_0: 8521,
            country_num_0: 14,
            country_1: 8399,
            country_num_1: 1,
            country_2: 8438,
            country_num_2: 1,
            country_count: 3,
            stars_week_country_0: 8483,
            stars_week_num_0: 749,
            stars_week_count: 1,
            current_star_count: 9535757,
            week_stars: 8264,
            next_bb: 586377955.82011,
            stat: 1
        });
        res.send(data);
    }
    // This is for the unkown numbers in scores
    const random_Raco = Math.floor(Math.random() * 2) + "," + Math.floor(Math.random() * 2) + "," + Math.floor(Math.random() * 2) + "*" + Math.floor(Math.random() * 2) + "," + Math.floor(Math.random() * 2) + "," + Math.floor(Math.random() * 2) + "*" + Math.floor(Math.random() * 2) + "," + Math.floor(Math.random() * 2) + "," + Math.floor(Math.random() * 2) + "*" + Math.floor(Math.random() * 2) + "," + Math.floor(Math.random() * 2) + "," + Math.floor(Math.random() * 2) + "*"

    // Get everyone's score data and combine, send to the user
    async function processScores(excludedSessionId) {
        try {
            const entries = [];

            // get a list of all `JSON` files
            const jsonFiles = await readdir(
                path.join(__dirname, "./tmp/userdb/")
            ).then(
                (files) => files.filter(
                    (file) => path.extname(file) === ".json" && !file.includes(excludedSessionId)
                )
            );

            // iterate through a list of all `JSON` files & read their content
            for (const [index, file] of jsonFiles.entries()) {
                const content = await readFile(
                    path.join(__dirname, "./tmp/userdb/", file)
                ).then(JSON.parse);

                // create an object for a new entry
                const sid = `s_${index + 1}`;
                const sc = `sc_${index + 1}`;
                const r = `r_${index + 1}`;
                const e = `e_${index + 1}`;
                const c = `c_${index + 1}`;
                const o = `o_${index + 1}`;


                // use the `spread syntax` to include the rest of the
                // properties in a new entry 
                const entry = {
                    [sid]: req.body.sid,
                    [sc]: req.body.total_score,
                    [r]: 8429,
                    [e]: random_Raco,
                    [c]: 1,
                    [o]: Math.floor(Math.random() * (200 - 1 + 1)) + 1
                };
                entries.push(entry);
            }

            const result = entries.map((entry) => serialize(entry)).join(";");

            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    processScores();


    // getPlayerScores - Halfly Done
    if (req.query.d === 'getPlayerScores') {

        const excludedSessionId = req.body.player_sid;
        let sessionid = req.body.sid
        let sendScore = req.body.send_score

        // Write user's score to JSON for ranking
        let user = require("./tmp/userdb/" + sessionid + ".json")
        user.score = req.body.total_score;
        json = JSON.stringify(user);
        fs.writeFileSync("./tmp/userdb/" + sessionid + ".json", json);



        let userScore = serialize({
            num: 8,
            t: 586377785.523,
            score: req.body.total_score,
            rank: 1,
            count: currentPlayerCount - 1,
            total: 17,
            theme0: 0,
            theme1: 0,
            coach0: 0,
            coach1: 0,
            coach2: 0,
            coach3: 0,
            stat: 1
        });

        let score = req.body.score
        if (!score) {
            res.send("method_id=1564;num=1;t=586377782.62;count=" + currentPlayerCount - 1 + ";stat=1")
        } else {

            processScores(excludedSessionId)
                .then(result => {
                    res.send("method_id=1564;" + result + ";" + userScore);
                })
                .catch(error => {
                    res.status(500).send("Something went wrong.");
                });

        }
    }


    // For combining everyone's rank
    async function processRank(excludedSessionId) {
        try {
            const entries = [];

            // get a list of all `JSON` files
            const jsonFiles = await readdir(
                path.join(__dirname, "./tmp/userdb/")
            ).then(
                (files) => files.filter(
                    (file) => path.extname(file) === ".json" && !file.includes(excludedSessionId)
                )
            );



            // iterate through a list of all `JSON` files & read their content
            for (const [index, file] of jsonFiles.entries()) {
                const content = await readFile(
                    path.join(__dirname, "./tmp/userdb/", file)
                ).then(JSON.parse);

                // create an object for a new entry
                const score0 = `score${index}`;
                const name = `name${index}`;
                const pays = `pays${index}`;
                const rank = `rank${index}`;
                const avatar = `avatar${index}`;
                const onlinescore = `onlinescore${index}`;
                const sid = `sid${index}`;
                const keyValue = Object.keys(content)[0];

                // use the `spread syntax` to include the rest of the
                // properties in a new entry 
                const entry = {
                    [score0]: content.score,
                    [name]: content.name,
                    [pays]: 8429,
                    [avatar]: content.avatar,
                    [onlinescore]: content.onlinescore,
                    [sid]: content.sessionid
                };
                entries.push(entry);
            }

            const result = entries.map((entry) => serialize(entry)).join(";");

            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    processRank();

    // getMyRank - Halfly Done
    if (req.query.d === 'getMyRank') {
        var sessionid = req.body.sid
        let user = require("./tmp/userdb/" + sessionid + ".json")
        const excludedSessionId = req.body.sid;

        let getUserData = serialize({
            onlinescore_updated: user.onlinescore,
        })

        let getUserData_Final = serialize({
            count: 23,
            total: 19,
            myrank: 12,
            myscore: user.score,
            song_id: req.body.song_id,
            theme0: 0,
            theme1: 0,
            coach0: 0,
            coach1: 0,
            coach2: 0,
            coach3: 0,
            nb_winners: 16,
            star_score: req.body.star_score,
            numscores: 9,
            t: 586378258.76805,
            stat: 1
        })


        processRank(excludedSessionId)
            .then(result => {
                res.send("method_id=1564;" + getUserData + result + ";" + getUserData_Final);
            })
            .catch(error => {
                res.status(500).send("Something went wrong.");
            });
    }

    if (req.query.d === 'sendVote') {
        res.send("method_id=840;votes=0;song_id=8658227481664;stat=1");
    }
});
