abstract class Slick {
    private static title: HTMLTitleElement | null = document.querySelector("title");
    private static favicon: HTMLLinkElement | null = document.querySelector("link[rel='icon shortcut']");
    private static script: HTMLScriptElement | null = document.querySelector("script[slick-src='script']");

    private static onloadListeners: Array<Function> = [];
    public static template: string | null = null;

    static {
        window.addEventListener("popstate", async (event: PopStateEvent) => {
            event.preventDefault();

            await Slick.redirect(Slick.getPathFromUrl(new URL(window.location.href)));
        });

        document.addEventListener("DOMContentLoaded", () => Slick.onload("a"));
    }

    private static getPathFromUrl(url: URL): string {
        return url.pathname + url.hash + url.search;
    }

    private static onload(selector: string): void {
        for (let link of Array.from(document.querySelectorAll<HTMLLinkElement>(selector))) {
            link.addEventListener("click", async event => {
                if (!["", "_self"].includes(link.getAttribute("target") ?? ""))
                    return;

                event.preventDefault();

                const url = new URL(link.href);
                if (window.location.host != url.host)
                    window.location.href = url.href;

                await Slick.redirect(Slick.getPathFromUrl(url));
            });
        }

        Slick.onloadListeners.forEach(async fnc => await fnc());
    }

    private static async loadStyles(styles: string[], type: string): Promise<void[]> {
        let stylesLoadedCount = styles.length;
    
        return Promise.all(
            styles.map(href => {
                const style = document.createElement("link");
                style.setAttribute("rel", "stylesheet");
                style.setAttribute("slick-type", type);
                style.setAttribute("href", href);

                style.addEventListener("load", () => --stylesLoadedCount || null);
        
                if (Slick.favicon != null)
                    Slick.favicon.insertAdjacentElement("beforebegin", style);
            })
        );
      }

    private static async loadScripts(scripts: string[], type: string): Promise<void> {
        for(let src of scripts){
            const script = document.createElement("script");
            script.setAttribute("type", "application/javascript");
            script.setAttribute("slick-type", type);

            const blob = new Blob([`(() => {${await (await fetch(src)).text()}})();`], { type: "application/javascript" });
            script.setAttribute("src", URL.createObjectURL(blob));

            document.body.appendChild(script);
        }
    }

    public static async redirect(url: string, reload: boolean = false): Promise<void> {
        if(reload)
            Slick.template = null;

        const rawResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ template: Slick.template })
        });
        const jsonResponse = await rawResponse.json();

        if(rawResponse.redirected)
            window.history.pushState({}, "", rawResponse.url);
        else
            window.history.pushState({}, "", url);

        document.title = jsonResponse.page.title;

        if(Slick.favicon == null || Slick.title == null || Slick.script == null)
            return;

        Slick.favicon.href = jsonResponse.page.favicon;
        const headChildren = Array.from(document.head.children);

        if(jsonResponse.template != null){
            Slick.template = jsonResponse.template.name;

            headChildren.slice(0, headChildren.indexOf(Slick.title)).forEach(e => e.remove());
            Slick.title.insertAdjacentHTML("beforebegin", jsonResponse.template.head);

            const oldTemplateStyles = document.querySelectorAll("link[rel='stylesheet'][slick-type='template']");
            if(jsonResponse.template.styles.length != 0)
                await Slick.loadStyles(jsonResponse.template.styles, "template");

            const bodyChildren = Array.from(document.body.children);
            bodyChildren.slice(0, bodyChildren.indexOf(Slick.script)).forEach(e => e.remove());
            Slick.script.insertAdjacentHTML("beforebegin", jsonResponse.template.body);

            oldTemplateStyles.forEach(s => s.remove());
            Array.from(document.querySelectorAll("script[slick-type='template']")).forEach(s => s.remove());

            await Slick.loadScripts(jsonResponse.template.scripts, "template");
            Slick.onload("a");
        }

        headChildren.slice(headChildren.indexOf(Slick.favicon) + 1).forEach(e => e.remove());
        Slick.favicon.insertAdjacentHTML("afterend", jsonResponse.page.head);

        const oldPageStyles = document.querySelectorAll("link[rel='stylesheet'][slick-type='page']");
        if(jsonResponse.page.styles.length != 0)
            await Slick.loadStyles(jsonResponse.page.styles, "page");

        const app = document.querySelector("#app");
        if (app != null)
            app.innerHTML = jsonResponse.page.body;

        oldPageStyles.forEach(s => s.remove());
        Array.from(document.querySelectorAll("script[slick-type='page']")).forEach(s => s.remove());

        await Slick.loadScripts(jsonResponse.page.scripts, "page");
        Slick.onload("#app a");

        if (window.location.hash == "")
            window.scrollTo(0, 0);
        else {
            const element = document.getElementById(window.location.hash.substring(1));
            if(element != null)
                element.scrollIntoView({ behavior: "smooth" });
        }
    }

    public static addOnloadListener(fnc: Function) {
        Slick.onloadListeners.push(fnc);
    }
}

abstract class SlickCookies {
    public static get(cname: string): string {
        const cookies = decodeURIComponent(document.cookie).split("; ");
        for (let cookie of cookies) {
            if (cookie.startsWith(`${cname}=`))
                return cookie.substring(cname.length + 1);
        }
        return "";
    }

    public static set(cname: string, cvalue: string, exdays: number = 14) {
        const date = new Date();
        date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
        document.cookie = `${cname}=${cvalue}; expires=${date.toUTCString()}; path=/; secure; SameSite=None;`;
    }

    public static delete(cname: string) {
        document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; secure; SameSite=None;`;
    }
}