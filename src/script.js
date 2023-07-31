class Slick{
    constructor(){
        // Initialisation des variables
        this.onloadListeners = []
        this.lastUrl = Slick.getPathFromLocation(window.location) ;
        this.favicon = document.querySelector("link[rel='icon shortcut']");

        // Ajout des events
        this.addEventsListener();
    }

    // Déclaration de la fonction statique permettant de récupérer le chemin à partir de l'objet Location
    static getPathFromLocation(location){
        return location.pathname + location.hash + location.search;
    }

    linkClickEvent(event){
        if(!["", "_self"].includes(link.target)){ return; }
        event.preventDefault();

        let element = event.target;
        while(element.nodeName != "A"){ element = element.parentNode; }

        const url = new URL(element.href);
        if(window.location.host != url.host){
            window.location.href = url.href;
            return;
        }

        this.updateUrl(Slick.getPathFromLocation(url));
    }

    addEventsListener(){
        document.addEventListener("DOMContentLoaded", this.onload.bind(this));
        window.addEventListener("popstate", (event) => {
            this.updateUrl(Slick.getPathFromLocation(event.target.location));
        });

        document.querySelectorAll("a:not(:root #root a)").forEach((link) => {
            link.addEventListener("click", this.linkClickEvent.bind(this))
        });
    }

    updateHtmlContent(page, styles) {
        document.getElementById("root").innerHTML = page.body;
    
        // Suppression des anciens styles et scripts
        styles.forEach(s => s.remove());
        Array.from(document.querySelectorAll("script[type='application/javascript']")).filter(s => s.src.endsWith("?slick-notrequired")).forEach(s => s.remove());
    
        // Ajout des nouveaux scripts
        page.scripts.forEach((src) => {
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
        }).then(response => response.json()).then((page) => {
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
            page.styles.forEach((href) => {
                const style = document.createElement("link");
                style.setAttribute("rel", "stylesheet");
                style.setAttribute("href", href);
    
                style.addEventListener("load", () => {
                    stylesLoadedCount++;
                    if (stylesLoadedCount === page.styles.length) {
                        this.updateHtmlContent(page, styles);
                    }
                });
    
                document.querySelector("title").insertAdjacentElement("afterend", style);
            });
        });
    }

    // Fonction executée au chargement de la page
    onload() {
        if(window.location.hash != ""){
            const element = document.getElementById(window.location.hash.substring(1));
            if(element != null){
                element.scrollIntoView({ behavior: "smooth" });
            }else{
                window.scrollTo(0, 0);
            }
        }else{
            window.scrollTo(0, 0);
        }
    
        document.querySelectorAll("#root a").forEach((link) => {
            link.addEventListener("click", (event) => {
                if(!["", "_self"].includes(link.target)){ return; }
                event.preventDefault();
    
                let element = event.target;
                while(element.nodeName != "A"){ element = element.parentNode; }
    
                const url = new URL(element.href);
                if(window.location.host != url.host){
                    window.location.href = url.href;
                    return;
                }
    
                this.updateUrl(Slick.getPathFromLocation(url));
            });
        });

        this.onloadListeners.forEach(async (fnc) => {
            await fnc();
        });
    }
}

const SLICK = new Slick();