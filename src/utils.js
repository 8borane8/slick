const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

module.exports = {
    randomInt: function(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    isNumber: function(){
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    range: function(min, max){
        let array = [];
        for (let i = min; i <= max; i++) { array.push(i); }
        return array;
    },

    randomString: function(n){
        let str = "";
        for (let i = 0; i < n; i++) { str += characters.charAt(Math.floor(Math.random() * characters.length)); }
    },

    convertToHtmlEntities: function(str){
        return str.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
            return "&#" + i.charCodeAt(0) + ";";
        });
    },

    isInvisibleString: function(str){
        return !/\S/.test(str);
    },

    parseCookieHeader: function(str){
        if(str == undefined){ return new Map(); }
        let cookies = new Map();
        str.split(";").forEach(function(cookie){
            cookie = cookie.split("=");
            cookies.set(cookie[0], cookie[1]);
        });

        return cookies;
    }
}