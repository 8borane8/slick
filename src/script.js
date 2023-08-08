class Slick {
    static _favicon = document.querySelector("link[rel='icon shortcut']");
    static _appName = "app";
    static _app = document.querySelector(`#${Slick._appName}`);
    static _onloadListeners = [];

    static initialize() {
        document.addEventListener("DOMContentLoaded", () => Slick._onload());

        window.addEventListener("popstate", async () => {
            await Slick.updateUrl(Slick._getPathFromLocation(window.location));
        });

        for (let link of document.querySelectorAll(`a:not(#${Slick._appName} a)`)){
            link.addEventListener("click", async (event) => {
                await Slick._aClickEvent(link, event);
            });
        }
    }

    static async _aClickEvent(link, event) {
        if (!["", "_self"].includes(link.target))
            return;

        event.stopPropagation();
        event.preventDefault();

        const url = new URL(link.href);
        if (window.location.host !== url.host)
            window.location.href = url.href;

        await Slick.updateUrl(Slick._getPathFromLocation(url));
    }

    static _getPathFromLocation(location) {
        return location.pathname + location.hash + location.search;
    }

    static async _onload() {
        for (let link of document.querySelectorAll(`#${Slick._appName} a`)) {
            link.addEventListener("click", async (event) => {
                await Slick._aClickEvent(link, event);
            });
        }

        const element = window.location.hash === "" ? null : document.getElementById(window.location.hash.substring(1));
        if (element === null)
            window.scrollTo(0, 0);
        else
            element.scrollIntoView({ behavior: "smooth" });

        Slick._onloadListeners.forEach(async (fnc) => await fnc());
    }

    static _updateHtmlContent(page, oldStyles) {
        Slick._app.innerHTML = page.body;

        oldStyles.forEach(s => s.remove());
        Array.from(document.querySelectorAll("script")).filter(s => s.src.endsWith("?Slick-not-required")).forEach(s => s.remove());

        for(let src of page.scripts){
            const script = document.createElement("script");
            script.setAttribute("type", "application/javascript");
            script.setAttribute("Slick-not-required", "");
            script.setAttribute("src", `${src}?Slick-not-required`);
    
            document.body.appendChild(script);
        }

        Slick._onload();
    }

    static addOnloadListener(fnc) {
        Slick._onloadListeners.push(fnc);
    }

    static async updateUrl(url) {
        const page = await (await fetch(url, { method: "POST" })).json();

        if (url.pathname === page.url) 
            window.history.pushState({}, "", url);
        else
            window.history.pushState({}, "", page.url);

        document.title = page.title;
        Slick._favicon.href = page.favicon;

        const headChildren = Array.from(document.head.children);
        headChildren.slice(headChildren.indexOf(Slick._favicon) + 1).forEach(e => e.remove());
        Slick._favicon.insertAdjacentHTML("afterend", page.head);

        const oldStyles = document.querySelectorAll("link[rel='stylesheet'][Slick-not-required='']");

        if(page.styles.length == 0){
            Slick._updateHtmlContent(page, oldStyles);
            return;
        }

        let stylesLoadedCount = 0;
        for (let href of page.styles) {
            const style = document.createElement("link");
            style.setAttribute("rel", "stylesheet");
            style.setAttribute("Slick-not-required", "");
            style.setAttribute("href", href);

            style.addEventListener("load", () => {
                stylesLoadedCount++;
                if (stylesLoadedCount === page.styles.length) {
                    Slick._updateHtmlContent(page, oldStyles);
                }
            });

            Slick._favicon.insertAdjacentElement("beforebegin", style);
        }
    }
}

Slick.initialize();