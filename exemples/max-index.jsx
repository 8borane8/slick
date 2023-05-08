module.exports = {
    path: "/",

    renders: {
        getMessage: async function(req){
            let message = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum beatae sed facilis excepturi soluta eligendi deleniti, et tempore autem voluptatum voluptate quos iusto ipsam fugiat repellat eveniet culpa provident laborum!";
            return <template>
                <p>{message}</p>
            </template>;
        }
    },

    title: "Test",
    icon: "/assets/favicon.ico",

    styles: [
        "/styles/index.css"
    ],
    scripts: [
        "/scripts/index.js"
    ],

    head: <template>
        
    </template>,

    body: <template>
        {getMessage()}
    </template>,

    canload: async function(req, res){
        if(false){
            // do stuff
            return "/login"; // Redirect page
        }
        
        return true; // Load page
    }
}