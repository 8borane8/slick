return {
    url: "/test",

    title: "Slick - Test",
    favicon: "/favicon.ico",

    styles: [
        "/styles/test.css"
    ],
    scripts: [
        "/scripts/test.js"
    ],

    head: <template>
        <meta name="keywords" content="test" />
    </template>,

    body: <template>
        <p>Test</p>
    </template>,

    canload: function(req){
        if(req.query.access ?? "false" == "true")
            return true;

        return "/?error=true";
    }
}