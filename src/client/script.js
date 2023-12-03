class Slick{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static _title = document.querySelector("title");
    static _favicon = document.querySelector("link[rel='icon shortcut']");
    static _script = document.querySelector("script[slick-src='script']");

    static _onloadListeners = new Array();
    static _template = null;

    static{
        window.addEventListener("popstate", async e => {
            e.preventDefault();
            await Slick.redirect(Slick._getPathFromLocation(e.target.location));
        });
        
        document.addEventListener("DOMContentLoaded", () => Slick._onload("a"));
    }

    static _getPathFromLocation(location) {
        return location.pathname + location.hash + location.search;
    }

    static _onload(selector){
        for (let link of Array.from(document.querySelectorAll(selector))) {
            link.addEventListener("click", async e => {
                e.preventDefault();

                if (!["", "_self"].includes(link.target))
                    return;

                const url = new URL(link.href);
                if (window.location.host !== url.host)
                    window.location.href = url.href;
        
                await Slick.redirect(Slick._getPathFromLocation(url));
            });
        }

        Slick._onloadListeners.forEach(async (fnc) => await fnc());
    }

    static _loadStyles(styles, type){
        let stylesLoadedCount = 0;

        return new Promise(resolve => {
            for (let href of styles) {
                const style = document.createElement("link");
                style.setAttribute("rel", "stylesheet");
                style.setAttribute("slick-type", type);
                style.addEventListener("load", () => {
                    stylesLoadedCount++;
                    if (stylesLoadedCount == styles.length)
                        resolve(null);
                });

                style.setAttribute("href", href);
                Slick._favicon.insertAdjacentElement("beforebegin", style);
            }

        });
    }

    static async _loadScripts(scripts, type){
        for(let src of scripts){
            const script = document.createElement("script");
            script.setAttribute("type", "application/javascript");
            script.setAttribute("slick-type", type);

            const blob = new Blob([`(() => {${await (await fetch(src)).text()}})();`], { type: "application/javascript" });
            script.setAttribute("src", URL.createObjectURL(blob));
    
            document.body.appendChild(script);
        }
    }

    static async reload(url = window.location.pathname){
        Slick._template = null;
        await Slick.redirect(url);
    }

    static async redirect(url){
        const rawResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ template: Slick._template })
        });
        const jsonResponse = await rawResponse.json();

        if(rawResponse.redirected)
            window.history.pushState({}, "", rawResponse.url);
        else
            window.history.pushState({}, "", url);

        document.title = jsonResponse.page.title;
        Slick._favicon.href = jsonResponse.page.favicon;

        const headChildren = Array.from(document.head.children);

        if(jsonResponse.template != null){
            Slick._template = jsonResponse.template.name;

            headChildren.slice(0, headChildren.indexOf(Slick._title)).forEach(e => e.remove());
            Slick._title.insertAdjacentHTML("beforebegin", jsonResponse.template.head);

            const oldTemplateStyles = document.querySelectorAll("link[rel='stylesheet'][slick-type='template']");
            if(jsonResponse.template.styles.length != 0)
                await Slick._loadStyles(jsonResponse.template.styles, "template");

            const bodyChildren = Array.from(document.body.children);
            bodyChildren.slice(0, bodyChildren.indexOf(Slick._script)).forEach(e => e.remove());
            Slick._script.insertAdjacentHTML("beforebegin", jsonResponse.template.body);

            oldTemplateStyles.forEach(s => s.remove());
            Array.from(document.querySelectorAll("script[slick-type='template']")).forEach(s => s.remove());

            await Slick._loadScripts(jsonResponse.template.scripts, "template");
            Slick._onload("a");
        }

        headChildren.slice(headChildren.indexOf(Slick._favicon) + 1).forEach(e => e.remove());
        Slick._favicon.insertAdjacentHTML("afterend", jsonResponse.page.head);

        const oldPageStyles = document.querySelectorAll("link[rel='stylesheet'][slick-type='page']");
        if(jsonResponse.page.styles.length != 0)
            await Slick._loadStyles(jsonResponse.page.styles, "page");

        document.querySelector("#app").innerHTML = jsonResponse.page.body;

        oldPageStyles.forEach(s => s.remove());
        Array.from(document.querySelectorAll("script[slick-type='page']")).forEach(s => s.remove());

        await Slick._loadScripts(jsonResponse.page.scripts, "page");
        Slick._onload("#app a");

        if (window.location.hash == "")
            window.scrollTo(0, 0);
        else
            document.getElementById(window.location.hash.substring(1)).scrollIntoView({ behavior: "smooth" });
    }

    static addOnloadListener(fnc) {
        if(!fnc instanceof Function)
            throw new Error("The listener must be a function.");

        Slick._onloadListeners.push(fnc);
    }
}

class SlickCookies{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static get(cname){
        let cookies = decodeURIComponent(document.cookie).split(';');
        for(let cookie of cookies){
            while(cookie.charAt(0) == " ") { c = c.substring(1); }
            if(cookie.indexOf(`${cname}=`) == 0)
                return cookie.substring(cname.length + 1, cookie.length);
        }
    
        return "";
    }

    static set(cname, cvalue, exdays = 14){
        const date = new Date();
        date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
        document.cookie = `${cname}=${cvalue};expires=${date.toUTCString()};path=/;secure;SameSite=None;`;
    }

    static delete(cname){
        document.cookie = `${cname}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;secure;SameSite=None;`;
    }
}