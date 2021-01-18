var twitter = require("twitter");

var client = new twitter({
  consumer_key: "JAABlOt9wzw9dyr8SASkPjRrj",
  consumer_secret: "ki0m1aFKtdYisdalDQUOHnfOS0EI5XC1Iez1xbhx0Htox2NwrI",
  access_token_key: "MU6_agAAAAABEpAOAAABdxCQDjI",
  access_token_secret: "kN6ZOmYPGcm0qyy2ta8R5JHKbuRsuYz7",
});
var params = { name: "Chirag" };
client.get("statuses/filter.json", params, (err, tweets, res) => {
  if (!err) {
    console.log(tweets);
  }
});
