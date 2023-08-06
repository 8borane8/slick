class Slick{
    static #favicon = document.querySelector("link[rel='icon shortcut']");
    static #appName = "app";
    static #app = document.querySelector(`#${Slick.#appName}`);
    static #onloadListeners = [];

    static {
        document.addEventListener("DOMContentLoaded", Slick.#onload);

        window.addEventListener("popstate", async (event) => await Slick.updateUrl(Slick.#getPathFromLocation(event.target.location)));
        document.querySelectorAll(`a:not(#${Slick.#appName} a)`).forEach(link => link.addEventListener("click", Slick.#aClickEvent));
    }

    static async #aClickEvent(event){
        if(!["", "_self"].includes(event.target.target))
            return;

        event.stopPropagation();
        event.preventDefault();

        const url = new URL(event.target.href);
        if(window.location.host != url.host)
            window.location.href = url.href;

        await Slick.updateUrl(Slick.#getPathFromLocation(url));
    }

    static #getPathFromLocation(location){
        return location.pathname + location.hash + location.search;
    }

    static async #onload(){
        const element = window.location.hash == "" ? null : document.getElementById(window.location.hash.substring(1));
        if(element == null)
            window.scrollTo(0, 0);
        else
            element.scrollIntoView({ behavior: "smooth" });
    
        document.querySelectorAll(`#${Slick.#appName} a`).forEach(link => link.addEventListener("click", Slick.#aClickEvent));
        for(let fnc of Slick.#onloadListeners)
            await fnc();
    }

    static #updateHtmlContent(page, oldStyles){
        Slick.#app.innerHTML = page.body;
    
        oldStyles.forEach(s => s.remove());
        document.querySelectorAll("script[slick-not-required='']").forEach(s => s.remove());
    
        page.scripts.forEach((src) => {
            const script = document.createElement("script");
            script.setAttribute("type", "application/javascript");
            script.setAttribute("slick-not-required", "");
            script.setAttribute("src", src);
    
            document.body.appendChild(script);
        });
    
        Slick.#onload();
    }

    static addOnloadListener(fnc){
        Slick.#onloadListeners.push(fnc);
    }

    static async updateUrl(url){
        const page = await (await fetch(url, {
            method: "POST"
        })).json();

        if(url.pathname == page.url)
            window.history.pushState({}, "", url);
        else
            window.history.pushState({}, "", page.url);

        document.title = page.title;
        Slick.#favicon.href = page.favicon;

        const headChildren = Array.from(document.head.children);
        headChildren.slice(headChildren.indexOf(Slick.#favicon) + 1).forEach(e => e.remove());
        Slick.#favicon.insertAdjacentHTML("afterend", page.head);

        const oldStyles = document.querySelectorAll("link[rel='stylesheet'][slick-not-required='']");

        if(page.styles.length == 0){
            Slick.#updateHtmlContent(page, oldStyles);
            return;
        }

        let stylesLoadedCount = 0;
        page.styles.forEach((href) => {
            const style = document.createElement("link");
            style.setAttribute("rel", "stylesheet");
            style.setAttribute("slick-not-required", "");
            style.setAttribute("href", href);

            style.addEventListener("load", () => {
                stylesLoadedCount++;
                if (stylesLoadedCount === page.styles.length)
                    Slick.#updateHtmlContent(page, oldStyles);
            });

            Slick.#favicon.insertAdjacentElement("beforebegin", style);
        });
    }
}