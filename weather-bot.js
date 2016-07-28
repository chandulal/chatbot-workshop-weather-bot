var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var http = require("http");
var jsonfile = require('jsonfile');
var conf = require('config');
var api = require("./api.js");

var app = express();
module.exports = app;
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 4567));

app.listen(app.get('port'));

var apiToken = conf.get('apiToken');
var pageToken = conf.get('pageToken');

var apiInstance = new api();

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === apiToken) {
        res.send(req.query['hub.challenge']);
    }
    else {
        res.send('Error, wrong validation token');
    }
});


app.post('/webhook/', function (req, res) {

    messaging_events = req.body.entry[0].messaging;

    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
            if (event.message && event.message.text) {
                text = event.message.text;

                // write your code here
                
                city = "delhi"

                http.get('http://api.openweathermap.org/data/2.5/weather?q='+ city +'&type=like&mode=json&APPID=e59499e71cae5e8de2730b3f21b5123d',
                          function(res) {
                    console.log("Got response: " + res.statusCode);

                    res.on("data", function(chunk) {
                        json = JSON.parse(chunk);
                        console.log(json);
                        messageData = {
                            text: "City:"+ city + "\n" +
                            "Weather:" + json.weather[0].main + "\n" +
                            "Temperature:" + json.main.temp + "K\n"+
                            "Humidity:" + json.main.humidity + "%\n"
                        };
                        apiInstance.send(sender, pageToken, messageData);
                    });
                }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });

            }
    }
    res.sendStatus(200);
});