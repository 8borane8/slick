import { Slick } from "../src/server/Slick.js";

const workingDirectory = import.meta.url.slice(8).split("/").slice(0, -1).join("/");

const slick = new Slick(workingDirectory, {
    port: 5005,
    config: {
        apiUrl: "http://127.0.0.1:5050"
    },
    development: true
});

slick.run();