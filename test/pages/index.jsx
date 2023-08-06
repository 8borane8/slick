return {
    url: "/",

    title: "Slick - Index",
    favicon: "/assets/favicon.ico",

    styles: [
        "/styles/index.css"
    ],
    scripts: [
        "/scripts/index.js"
    ],

    head: <template>
        <meta name="keywords" content="index" />
    </template>,

    body: async function(_req){
        console.log(config);
        return <template>
            <p>Index</p>
        </template>;
    },

    canload: null
}