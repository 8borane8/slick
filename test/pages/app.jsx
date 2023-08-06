return {
    url: "app",

    styles: [
        "/styles/app.css"
    ],
    scripts: [
        "/scripts/app.js"
    ],

    head: <template>
        <meta name="keywords" content="app" />
    </template>,

    body: <template>
        <a href="/">Index</a><br />
        <a href="/test">Test</a><br />
        <a href="/test?access=true">Test Access</a><br /><br />

        <a href="https://google.com">Google</a><br />
        <a href="https://google.com" target="_blank">Google _blank</a><br />

        <p>Header</p>
        <div id="app"></div>
        <p>Footer</p>
    </template>,

    onrequest: null
};