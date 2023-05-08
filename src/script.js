class Slick{
    constructor(){
        // Initialisation des variables
        this.lastUrl = Slick.getPathFromLocation(window.location) ;
        this.favicon = document.querySelector("link[rel='icon shortcut']");

        // Ajout des events
        window.addEventListener("popstate", function(event){
            event.preventDefault();
            SLICK.updateUrl(Slick.getPathFromLocation(event.target.location));
        });
        
        document.addEventListener("DOMContentLoaded", function(){
            SLICK.onload();
        });
    }

    // Déclaration de la fonction statique permettant de récupérer le chemin à partir de l'objet Location
    static getPathFromLocation(location){
        return location.pathname + location.hash + location.search;
    }

    static updateHtmlContent(page, styles) {
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
    
        SLICK.onload();
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
    
            SLICK.lastUrl = Slick.getPathFromLocation(window.location)
    
            // Mise à jour du titre et de l'icon
            document.title = page.title;
            SLICK.favicon.href = page.icon == null ? "" : page.icon;
    
            // Mise à jour du head
            Array.from(document.head.children).slice(Array.from(document.head.children).indexOf(SLICK.favicon) + 1).forEach(e => e.remove());
            SLICK.favicon.insertAdjacentHTML("afterend", page.head);
    
            // Récupération des anciens styles
            const styles = Array.from(document.querySelectorAll("link[rel='stylesheet']")).filter(s => s.href.endsWith("?slick-notrequired"));
            if(page.styles.length == 0){
                Slick.updateHtmlContent(page, styles);
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
                    if (stylesLoadedCount === page.styles.length) { Slick.updateHtmlContent(page, styles); }
                });
    
                document.querySelector("title").insertAdjacentElement("afterend", style);
            });
        });
    }

    // Fonction executée au chargement de la page
    onload() {
        if(window.location.hash != ""){ try{ document.getElementById(window.location.hash.substring(1)).scrollIntoView({ behavior: "smooth" }); }catch{} }
    
        document.querySelectorAll("a").forEach(function(link){
            link.addEventListener("click", function(event){
                event.preventDefault();
    
                let link = event.target;
                while(link.nodeName != "A"){ link = link.parentNode; }
    
                const url = new URL(link.href);
                if(window.location.host != url.host){
                    window.location.href = url.href;
                    return;
                }
    
                SLICK.updateUrl(Slick.getPathFromLocation(url));
            });
        });
    }
}

const SLICK = new Slick();