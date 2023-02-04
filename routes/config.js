const { TwitterApi } = require("twitter-api-v2");

const client = new TwitterApi({
    appKey: "2vRhZBbmhxuoDI1LjQQwsxNOc",
    appSecret: "AYiyG4w3CWTiPguDG6vFY0dxnxI65FoDNFGGzfYWfPd2kwljUt",
    accessToken: "1303360569546686465-C0IXe5zWty5SMRHXY9IgnMPa0HJEWr",
    accessSecret: "p9GB410RKFtYPc5XklYQMZZWy2y3F4W3cncHNzTQZA7ZB",
});

const rwClient = client.readWrite;

module.exports = rwClient;