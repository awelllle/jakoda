
var App = require("./app");
var Auth = require("./auth");

module.exports = function(app) {
app.use("/auth", Auth);
app.use("/", App);

};