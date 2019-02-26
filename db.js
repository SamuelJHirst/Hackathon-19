var jsonfile = require("jsonfile");

module.exports = {
    get: function(file) {
        return new Promise((resolve, reject) => {
            jsonfile.readFile(__dirname + "/db/" + file, function(err, arr) {
                resolve(arr);
            });
        });
    },
    find: function(file, id) {
        return new Promise((resolve, reject) => {
            jsonfile.readFile(__dirname + "/db/" + file, function(err, arr) {
                i = arr.findIndex(x => x.id == id);
                resolve(arr[i]);
            });
        });
    },
    add: function(file, obj) {
        return new Promise((resolve, reject) => {
            jsonfile.readFile(__dirname + "/db/" + file, function(err, arr) {
                arr.push(obj);
                jsonfile.writeFile(__dirname + "/db/" + file, arr, function(err, resp) {
                    resolve();
                });
            });
        });
    }
}