var express = require('express')
var bodyParser = require('body-parser')
var server = express()
port = parseInt(process.env.PORT, 10) || 8080;

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
server.use(bodyParser.json())

const db = require("./data/db.js");

const serverDate = new Date();

const users = [
];

server.get('/', (req, res) => {
    res.send('Hello World!');
});

server.get('/api/users', (req, res) => {
    db
        .find()
        .then(users => {
            res.send(users);
        })
        .catch(err => {
            res.status(550).json({ error: err, message: "could not get users" });
        });
});

server.get("/api/users/:id", (req, res) => {
    db
        .findById(req.params.id)
        .then(user => {
            if (!user) {
                res
                    .status(404)
                    .json({ message: "Could not find user in database with user ID " + req.params.id });
            } else {
                res.json(user);
            }
        })
        .catch(err => {
            res.status(400).json({ error: err, message: "Error at findById call" });
        });
});

server.post("/api/users", (req, res) => {

    if (!req.body) {
        console.log("REQUEST", req.body)
        res
            .status(400)
            .json({ message: "no body" });
    }

    const newUser = {
        name: req.body.name,
        bio: req.body.bio,
        created_at: serverDate.getTime(),
        updated_at: serverDate.getTime()
    };

    if (!newUser.name) {
        res
            .status(400)
            .json({ message: "You must provide a name while posting a new user" });
    } else {
        db
            .insert(newUser)
            .then(user => {
                res.status(201).json(user);
            })
            .catch(err => {
                res.json({ error: err, message: "Error at .insert call" });
            });
    }
});

server.delete("/api/users/:id", (req, res) => {

    db.findById(req.params.id)
        .then(user => {
            if (!user) {
                res
                    .status(404)
                    .json({ message: "Could not find user in database with user ID " + req.params.id });
            } else {
                db
                    .remove(req.params.id)
                    .then(result => {
                        res.status(201).json(result);
                    })
                    .catch(err => {
                        res.status(500).json({ error: err, message: "Error at .remove call" });
                    });
            }
        });
});

server.put("/api/users/:id", (req, res) => {

    db
        .findById(req.params.id)
        .then(user => {
            if (!user) {
                res
                    .status(404)
                    .json({ message: "Could not find user in database with user ID " + req.params.id });
            } else if (!req.body.name) {
                res
                    .status(400)
                    .json({ error: "You must provide a name while putting a user" });
            } else {
                db
                    .update(req.params.id, req.body)
                    .then(response => {
                        res.status(200).json(response);
                    })
                    .catch(err => {
                        res.status(500).json({ error: err, message: "Error at .update call" });
                    });
            }
        });
});

server.listen(port, () => console.log('API running on port ' + port));