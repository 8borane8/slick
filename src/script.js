var lastUrl = document.location.pathname + document.location.search;

function updateHtmlContent(page, styles) {
    document.title = page.title;
    document.getElementById("root").innerHTML = page.html;

    document.querySelectorAll('link[rel="stylesheet"][notrequired], script[type="application/javascript"][notrequired]').forEach((element) => {
        element.remove();
    });

    styles.forEach(function(style) {
        style.setAttribute("notrequired", "");
    });

    page.scripts.forEach(function(href) {
        let script = document.createElement("script");
        script.setAttribute("type", "application/javascript");
        script.setAttribute("notrequired", "");
        script.setAttribute("src", href);

        document.body.appendChild(script);
    });

    onload();
}

function updateUrl(url, force = false) {
    fetch(url, {
        method: "POST",
        cache: "no-cache"
    }).then((response) => response.json()).then(function(page){
        if(lastUrl == page.path && !force){
            if(url.split("#").length == 2){
                document.getElementById(url.split("#")[1]).scrollIntoView({ behavior: "smooth" });
                window.history.pushState({}, "", `#${url.split("#")[1]}`);
            }
            return;
        }
        if(url.split("?")[0].split("#")[0] == page.path){
            window.history.pushState({}, "", url);
            lastUrl = url;
        }else{
            window.history.pushState({}, "", page.path);
            lastUrl = page.path;
        }
    
        if(page.icon != null){
            let favicon = document.querySelector("link[rel='icon shortcut']");
            if(favicon){
                favicon.href = page.icon;
            }else{
                favicon = document.createElement("link");
                favicon.rel = "icon shortcut";
                favicon.href = page.icon;
                document.head.appendChild(favicon);
            }
        }

        if(page.styles.length == 0){
            return updateHtmlContent(page, []);
        }

        let styles = [];
        page.styles.forEach(function(href) {
            let style = document.createElement("link");
            style.setAttribute("rel", "stylesheet");
            style.setAttribute("type", "text/css");
            style.setAttribute("href", href);
    
            document.head.appendChild(style);

            style.addEventListener('load', function() {
                styles.push(style);

                if(styles.length == page.styles.length){updateHtmlContent(page, styles);}
            });
        });
    });
}

function onload() {
    if(document.location.hash != ""){
        document.querySelector(document.location.hash).scrollIntoView({ behavior: "smooth" });
    }

    document.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', function(event){
            event.preventDefault();

            let link = event.target;
            while(link.nodeName != "A"){ link = link.parentNode; }
            link = new URL(link.href);
            if(document.location.host != link.host){
                return document.location.href = link.href;
            }
            updateUrl(link.pathname + link.hash + link.search, false);
        });
    });
}

window.addEventListener('popstate', function(event){
    updateUrl(event.target.location.pathname);
});

document.addEventListener("DOMContentLoaded", onload);