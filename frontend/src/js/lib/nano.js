// https://github.com/trix/nano/blob/1df4fd19021210135f03ed74ed7ac02701d446c3/nano.js
function nano(template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split("."), v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
    });
}
