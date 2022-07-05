/*
#####       sales webscrapping       #####
#          Developed by Baramex          #
### github: https://github.com/baramex ###

License: lgpl-3.0
*/

const toGet = 0; // nombre de profils à récupérer (0: tous les profils de la page)

// création hidden-tab et texte
var div = document.createElement("div");
div.style.position = "fixed";
div.style.width = "100vw";
div.style.height = "100vh";
div.style.backgroundColor = "rgba(0, 0, 0, .8)";
div.style.backdropFilter = "blur(5px)";
div.style.zIndex = 9999;
div.style.top = "0";
div.style.left = "0";
div.style.display = "flex";
div.style.alignItems = "center";
div.style.justifyContent = "center";
div.style.flexDirection = "column";
div.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
document.body.append(div);

var text = document.createElement("h1");
text.style.color = "white";
text.innerText = "Chargement des profils...";
text.style.fontSize = "60px";
div.append(text);

// scroll pour charger les ressources
var bScroll = 0;
var container = document.getElementById("search-results-container");
container.scrollIntoView();
var int = setInterval(() => {
    container.scrollBy({ top: 50 });

    if (bScroll >= container.scrollTop) {
        scrolled();
        return clearInterval(int);
    }

    bScroll = container.scrollTop;
}, 1);

async function scrolled() {
    // webscrapping - séparation des champs
    var elements = document.querySelectorAll("#search-results-container ol > li");

    var formatted = [];
    for (let i = 0; i < elements.length && (i < toGet || toGet == 0); i++) {
        text.innerText = "Recuperation des profils... " + i + "/" + elements.length;

        var ol = elements[i];

        var fullname = ol.querySelector("a[data-anonymize=person-name]")?.innerText?.trim();
        if (!fullname) {
            console.error(ol);
            continue;
        }

        var address = ol.querySelector("span.t-12")?.innerText?.trim();
        var company = ol.querySelector("a[data-anonymize=company-name]")?.innerText?.trim();
        if (!company) {
            company = ol.querySelector("div.t-14").childNodes.item([...ol.querySelector("div.t-14").childNodes.values()].findIndex(a => a.classList?.contains("separator--middot")) + 1)?.textContent?.trim();
        }
        var job = ol.querySelector("div.t-14 > span:first-of-type")?.innerText?.trim();
        var date = ol.querySelector("div.artdeco-entity-lockup__metadata")?.innerText?.trim();

        formatted.push({ fullname, job, company, date, address });
    }

    // création du texte formaté
    var formattedText = "";
    formatted.forEach((doc, i, l) => {
        Object.values(doc).forEach((val, _i, _l) => {
            formattedText += val + (_i < _l.length - 1 ? "\t" : "");
        });
        if (i < l.length - 1) formattedText += "\n";
    });

    // création interface boutons
    var btn = document.createElement("button");
    btn.innerText = "Copier le texte";
    btn.style.padding = "20px 80px";
    btn.style.fontSize = "100px";
    btn.style.outline = "none";
    btn.style.border = "none";
    btn.style.backgroundColor = "rgb(200, 250, 200)";
    btn.style.color = "rgb(40, 40, 40)";
    btn.style.borderRadius = "10px";
    btn.style.cursor = "pointer";
    div.append(btn);

    var closeBtn = document.createElement("button");
    closeBtn.innerText = "X";
    closeBtn.style.fontSize = "60px";
    closeBtn.style.outline = "none";
    closeBtn.style.border = "none";
    closeBtn.style.background = "none";
    closeBtn.style.color = "rgb(240, 240, 240)";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "50px";
    closeBtn.style.right = "30px";
    div.append(closeBtn);

    // évènement de clic des boutons
    closeBtn.onclick = () => {
        div.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => div.remove();
    }

    btn.onclick = () => {
        div.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => div.remove();

        navigator.permissions.query({ name: "clipboard-write" }).then(result => {
            if (result.state == "granted" || result.state == "prompt") {
                navigator.clipboard.writeText(formattedText).then(() => {
                    console.log("Copie !");
                }, () => {
                    console.error("Impossible de copier...");
                });
            }
            else console.error("Impossible de copier...");
        });
    };

    console.log(formatted.length + " documents formates pour un tableur, appuyez sur le bouton pour copier le contenu");
}