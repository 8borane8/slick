const title = "Header";

module.exports = {
    path: "__app__",

    configuration: {
        lang: "fr",
        default404: "/",
        onrequest: async function(req, res){
            if(false){
                res.status(200).send("Erreur");
                return false;
            }
            
            return true;
        }
    },

    renders: {
        getMessage: async function(req){
            return <template>
                <h1>{title}</h1>
            </template>;
        }
    },

    styles: [
        "/styles/index.css"
    ],
    scripts: [
        "/scripts/index.js"
    ],

    head: <template>
        
    </template>,

    body: <template>
        <header>{getTitle()}</header>
        <div id="root"></div>
    </template>,
}