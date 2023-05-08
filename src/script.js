class Slick{
    constructor(){
        // Initialisation des variables
        this.lastUrl = Slick.getPathFromLocation(window.location) ;
        this.favicon = document.querySelector("link[rel='icon shortcut']");

        // Ajout des events
        this.addEventsListener();
    }

    // Déclaration de la fonction statique permettant de récupérer le chemin à partir de l'objet Location
    static getPathFromLocation(location){
        return location.pathname + location.hash + location.search;
    }

    addEventsListener(){
        document.addEventListener("DOMContentLoaded", this.onload.bind(this));
        window.addEventListener("popstate", function(event){
            this.updateUrl(Slick.getPathFromLocation(event.target.location));
        }.bind(this));
    }

    updateHtmlContent(page, styles) {
        document.getElementById("root").innerHTML = page.body;
    
        // Suppression des anciens styles et scripts
        styles.forEach(s => s.remove());
        Array.from(document.querySelectorAll("script[type='application/javascript']")).filter(s => s.src.endsWith("?slick-notrequired")).forEach(s => s.remove());
    
        // Ajout des nouveaux scripts
        page.scripts.forEach(function(src) {
            const script = document.createElement("script");
            script.setAttribute("type", "application/javascript");
            script.setAttribute("src", src);
    
            document.body.appendChild(script);
        });
    
        this.onload();
    }
    
    updateUrl(url) {
        fetch(url, {
            method: "POST",
            cache: "no-cache"
        }).then(response => response.json()).then(function(page){
            url = new URL(url, window.location.href);
    
            // Mise à jour de l'url
            if(url.pathname == page.path){ window.history.pushState({}, "", url); }
            else{ window.history.pushState({}, "", page.path); }
    
            this.lastUrl = Slick.getPathFromLocation(window.location)
    
            // Mise à jour du titre et de l'icon
            document.title = page.title;
            this.favicon.href = page.icon == null ? "" : page.icon;
    
            // Mise à jour du head
            Array.from(document.head.children).slice(Array.from(document.head.children).indexOf(this.favicon) + 1).forEach(e => e.remove());
            this.favicon.insertAdjacentHTML("afterend", page.head);
    
            // Récupération des anciens styles
            const styles = Array.from(document.querySelectorAll("link[rel='stylesheet']"))
                .filter(s => s.href.endsWith("?slick-notrequired"));

            if(page.styles.length == 0){
                this.updateHtmlContent(page, styles);
                return;
            }
    
            // Ajout des nouvaux styles
            let stylesLoadedCount = 0;
            page.styles.forEach(function(href) {
                const style = document.createElement("link");
                style.setAttribute("rel", "stylesheet");
                style.setAttribute("href", href);
    
                style.addEventListener("load", function(){
                    stylesLoadedCount++;
                    if (stylesLoadedCount === page.styles.length) {
                        this.updateHtmlContent(page, styles);
                    }
                }.bind(this));
    
                document.querySelector("title").insertAdjacentElement("afterend", style);
            }.bind(this));
        }.bind(this));
    }

    // Fonction executée au chargement de la page
    onload() {
        if(window.location.hash != ""){
            try{
                document.getElementById(window.location.hash.substring(1))
                    .scrollIntoView({ behavior: "smooth" });
            }catch{}
        }
    
        document.querySelectorAll("a").forEach(function(link){
            link.addEventListener("click", function(event){
                event.preventDefault();
    
                let element = event.target;
                while(element.nodeName != "A"){ element = element.parentNode; }
    
                const url = new URL(element.href);
                if(window.location.host != url.host){
                    window.location.href = url.href;
                    return;
                }
    
                this.updateUrl(Slick.getPathFromLocation(url));
            }.bind(this));
        }.bind(this));
    }
}

const SLICK = new Slick();