```javascript
/* =========================================================
   MY PORTFOLIO
   Responsive + GitHub Pages compatible
   ========================================================= */


/* =========================================================
   PORTFOLIO CATEGORIES
   ========================================================= */

const CATS = [

    [
        "quiz",
        "Quiz",
        "Short quizzes I have taken."
    ],

    [
        "longquiz",
        "Long Quiz",
        "Longer quizzes covering full lessons."
    ],

    [
        "midterms",
        "Midterms",
        "Midterm exams and results."
    ],

    [
        "finals",
        "Finals",
        "Final exams and results."
    ],

    [
        "activity",
        "Activity",
        "Classroom and take-home activities."
    ],

    [
        "project",
        "Project",
        "Projects I built and presented."
    ]

];


const $ = selector =>
    document.querySelector(selector);


/* =========================================================
   LOCAL DATABASE
   ========================================================= */

let db = null;

const memory = {

    files: [],

    meta: {}

};


/* OPEN DATABASE */

function openDB() {

    return new Promise(resolve => {

        try {

            const request =
                indexedDB.open(
                    "my-portfolio-v2",
                    1
                );


            request.onupgradeneeded =
                function () {

                    const database =
                        request.result;


                    if (
                        !database.objectStoreNames.contains(
                            "files"
                        )
                    ) {

                        database.createObjectStore(
                            "files",
                            {
                                keyPath: "id"
                            }
                        );

                    }


                    if (
                        !database.objectStoreNames.contains(
                            "meta"
                        )
                    ) {

                        database.createObjectStore(
                            "meta"
                        );

                    }

                };


            request.onsuccess =
                function () {

                    db = request.result;

                    resolve();

                };


            request.onerror =
                function () {

                    resolve();

                };

        }

        catch (error) {

            resolve();

        }

    });

}


/* DATABASE REQUEST */

function requestPromise(request) {

    return new Promise(
        (resolve, reject) => {

            request.onsuccess =
                () => resolve(request.result);

            request.onerror =
                () => reject(request.error);

        }
    );

}


/* GET OBJECT STORE */

function objectStore(
    name,
    mode = "readonly"
) {

    return db
        .transaction(name, mode)
        .objectStore(name);

}


/* GET ALL FILES */

async function getAllFiles() {

    try {

        if (db) {

            return await requestPromise(
                objectStore("files")
                    .getAll()
            );

        }

        return memory.files;

    }

    catch {

        return memory.files;

    }

}


/* SAVE FILE */

async function saveFile(file) {

    try {

        if (db) {

            await requestPromise(
                objectStore(
                    "files",
                    "readwrite"
                ).put(file)
            );

        }

        else {

            memory.files.push(file);

        }

    }

    catch {

        memory.files.push(file);

    }

}


/* DELETE FILE */

async function deleteFile(id) {

    try {

        if (db) {

            await requestPromise(
                objectStore(
                    "files",
                    "readwrite"
                ).delete(id)
            );

        }

        else {

            memory.files =
                memory.files.filter(
                    file =>
                        file.id !== id
                );

        }

    }

    catch {}

}


/* SAVE META */

async function saveMeta(
    key,
    value
) {

    try {

        if (db) {

            await requestPromise(
                objectStore(
                    "meta",
                    "readwrite"
                ).put(value, key)
            );

        }

        else {

            memory.meta[key] =
                value;

        }

    }

    catch {

        memory.meta[key] =
            value;

    }

}


/* GET META */

async function getMeta(key) {

    try {

        if (db) {

            return await requestPromise(
                objectStore("meta")
                    .get(key)
            );

        }

        return memory.meta[key];

    }

    catch {

        return memory.meta[key];

    }

}


/* =========================================================
   CREATE PORTFOLIO SECTIONS
   ========================================================= */

const host =
    $("#sections");

const menu =
    $("#menu");


CATS.forEach(
    ([id, title, description]) => {

        menu.insertAdjacentHTML(
            "beforeend",

            `
            <li>
                <a href="#${id}">
                    ${title}
                </a>
            </li>
            `
        );


        host.insertAdjacentHTML(
            "beforeend",

            `
            <section
                class="blk rv"
                id="${id}"
            >

                <h2>${title}</h2>

                <p class="sub">
                    ${description}
                </p>


                <label
                    class="drop admin-only"
                    data-c="${id}"
                >

                    <input
                        type="file"
                        multiple
                        hidden
                    >

                    <div>

                        <b>
                            Upload pictures or files
                        </b>

                        <br>

                        Drag and drop here
                        or click to choose.

                    </div>

                </label>


                <div
                    class="grid"
                    id="g-${id}"
                ></div>

            </section>
            `

        );

    }
);


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function fileSize(bytes) {

    if (bytes > 1048576) {

        return (
            bytes / 1048576
        ).toFixed(1)
        + " MB";

    }

    return Math.max(
        1,
        Math.round(bytes / 1024)
    )
    + " KB";

}


/* ESCAPE HTML */

function escapeHTML(value) {

    return String(value)
        .replace(
            /[&<>"']/g,

            character => {

                const map = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"

                };

                return map[character];

            }

        );

}


/* TOAST */

let toastTimer;

function toast(message) {

    const element =
        $("#toast");

    element.textContent =
        message;

    element.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   PUBLIC MODE
   ========================================================= */

let SITE = null;


function isPublicMode() {

    return (
        SITE !== null &&
        !location.search.includes(
            "admin"
        )
    );

}


/* =========================================================
   RENDER FILES
   ========================================================= */

const objectURLs = [];


async function renderFiles() {

    objectURLs.forEach(
        url =>
            URL.revokeObjectURL(url)
    );

    objectURLs.length = 0;


    let files;


    if (isPublicMode()) {

        files =
            Array.isArray(
                SITE.files
            )
                ? SITE.files
                : [];

    }

    else {

        files =
            await getAllFiles();

    }


    CATS.forEach(
        ([category]) => {

            const grid =
                $(`#g-${category}`);

            const list =
                files.filter(
                    file =>
                        file.cat === category
                );


            grid.innerHTML = "";


            if (!list.length) {

                grid.innerHTML =
                    `
                    <p class="empty">
                        Nothing here yet.
                    </p>
                    `;

                return;

            }


            list.forEach(
                file => {

                    let url;


                    if (
                        isPublicMode()
                    ) {

                        url =
                            file.path;

                    }

                    else {

                        url =
                            URL.createObjectURL(
                                file.blob
                            );

                        objectURLs.push(url);

                    }


                    const isImage =
                        (
                            file.type || ""
                        ).startsWith(
                            "image/"
                        );


                    const extension =
                        (
                            file.name
                            .split(".")
                            .pop() ||
                            "FILE"
                        )
                        .slice(0, 5)
                        .toUpperCase();


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "item";


                    item.innerHTML =

                        `
                        <div class="thumb">

                            ${
                                isImage

                                ?

                                `
                                <img
                                    src="${escapeHTML(url)}"
                                    alt="${escapeHTML(file.name)}"
                                >
                                `

                                :

                                `
                                <span class="ext">
                                    ${escapeHTML(extension)}
                                </span>
                                `
                            }

                        </div>


                        <div class="meta">

                            <div
                                title="${escapeHTML(file.name)}"
                            >
                                ${escapeHTML(file.name)}
                            </div>

                            <small>
                                ${fileSize(file.size || 0)}
                            </small>

                        </div>


                        <div class="acts">

                            ${
                                isImage

                                ?

                                `
                                <button class="view">
                                    View
                                </button>
                                `

                                :

                                `
                                <a
                                    href="${escapeHTML(url)}"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    Open
                                </a>
                                `
                            }


                            <a
                                href="${escapeHTML(url)}"
                                download="${escapeHTML(file.name)}"
                            >
                                Save
                            </a>


                            ${
                                isPublicMode()

                                ?

                                ""

                                :

                                `
                                <button class="del">
                                    Delete
                                </button>
                                `
                            }

                        </div>
                        `;


                    if (isImage) {

                        const openImage =
                            () => {

                                $("#lb img").src =
                                    url;

                                $("#lb")
                                    .classList
                                    .add(
                                        "lbshow"
                                    );

                            };


                        item
                            .querySelector(
                                ".thumb"
                            )
                            .onclick =
                            openImage;


                        item
                            .querySelector(
                                ".view"
                            )
                            .onclick =
                            openImage;

                    }


                    if (!isPublicMode()) {

                        item
                            .querySelector(
                                ".del"
                            )
                            .onclick =
                            async () => {

                                if (
                                    confirm(
                                        "Delete this file?"
                                    )
                                ) {

                                    await deleteFile(
                                        file.id
                                    );

                                    renderFiles();

                                }

                            };

                    }


                    grid.appendChild(
                        item
                    );

                }

            );

        }
    );


    updateStats(files);

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStats(files) {

    $("#s1").textContent =
        files.length;


    $("#s2").textContent =
        files.filter(
            file =>
                (
                    file.type || ""
                ).startsWith(
                    "image/"
                )
        ).length;


    $("#s3").textContent =
        files.filter(
            file =>
                !(
                    file.type || ""
                ).startsWith(
                    "image/"
                )
        ).length;

}


/* =========================================================
   UPLOAD
   ========================================================= */

async function addFiles(
    category,
    files
) {

    for (
        const file of files
    ) {

        const id =
            Date.now()
            + "-"
            + Math.random()
                .toString(36)
                .slice(2);


        await saveFile({

            id,

            cat:
                category,

            name:
                file.name,

            type:
                file.type ||
                "application/octet-stream",

            size:
                file.size,

            blob:
                file

        });

    }


    await renderFiles();


    toast(
        `${files.length} file${
            files.length > 1
                ? "s"
                : ""
        } saved on this device.`
    );

}


/* =========================================================
   UPLOAD EVENTS
   ========================================================= */

function setupUploads() {

    document
        .querySelectorAll(
            ".drop"
        )
        .forEach(drop => {

            const input =
                drop.querySelector(
                    "input"
                );

            const category =
                drop.dataset.c;


            input.onchange =
                () => {

                    if (
                        input.files.length
                    ) {

                        addFiles(
                            category,
                            [
                                ...input.files
                            ]
                        );

                    }

                    input.value = "";

                };


            [
                "dragenter",
                "dragover"
            ]
            .forEach(
                event => {

                    drop.addEventListener(
                        event,
                        e => {

                            e.preventDefault();

                            drop.classList.add(
                                "over"
                            );

                        }
                    );

                }
            );


            [
                "dragleave",
                "drop"
            ]
            .forEach(
                event => {

                    drop.addEventListener(
                        event,
                        e => {

                            e.preventDefault();

                            drop.classList.remove(
                                "over"
                            );

                        }
                    );

                }
            );


            drop.addEventListener(
                "drop",
                event => {

                    const files =
                        event
                            .dataTransfer
                            .files;


                    if (
                        files.length
                    ) {

                        addFiles(
                            category,
                            [
                                ...files
                            ]
                        );

                    }

                }
            );

        });

}


/* =========================================================
   PROFILE PHOTO
   ========================================================= */

function setProfilePhoto(url) {

    const photo =
        $("#pic");


    const oldImage =
        photo.querySelector(
            "img"
        );


    if (oldImage) {

        oldImage.remove();

    }


    const image =
        document.createElement(
            "img"
        );


    image.src =
        url;

    image.alt =
        "Profile photo";


    photo.appendChild(
        image
    );

}


async function loadProfilePhoto() {

    const image =
        await getMeta(
            "profilePhoto"
        );


    if (image) {

        setProfilePhoto(
            URL.createObjectURL(
                image
            )
        );

    }

}


/* =========================================================
   EDITABLE TEXT
   ========================================================= */

async function loadText() {

    const elements =
        document.querySelectorAll(
            "[data-k]"
        );


    for (
        const element of elements
    ) {

        const value =
            await getMeta(
                "text-" +
                element.dataset.k
            );


        if (value) {

            element.textContent =
                value;

        }

    }

}


function setupEditing() {

    document
        .querySelectorAll(
            "[data-k]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "input",
                    async () => {

                        await saveMeta(
                            "text-" +
                            element.dataset.k,

                            element.textContent
                        );

                    }
                );

            }
        );


    $("#picIn").onchange =
        async event => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            await saveMeta(
                "profilePhoto",
                file
            );


            setProfilePhoto(
                URL.createObjectURL(
                    file
                )
            );


            toast(
                "Profile photo saved."
            );

        };

}


/* =========================================================
   PUBLIC CONTENT
   ========================================================= */

function applyPublicContent() {

    document.body.classList.add(
        "pub"
    );


    const profile =
        SITE.profile || {};


    $("#publicName").textContent =
        profile.name ||
        "My Portfolio";


    $("#publicRole").textContent =
        profile.role ||
        "Student · Aspiring Developer";


    $("#publicBio").textContent =
        profile.bio ||
        "";


    $("#publicFacts").innerHTML =
        [
            profile.f1,
            profile.f2,
            profile.f3
        ]
        .filter(Boolean)
        .map(
            value =>
                `<span>${escapeHTML(value)}</span>`
        )
        .join("");


    if (
        profile.pic
    ) {

        setProfilePhoto(
            profile.pic
        );

    }

    else {

        $("#pic").style.display =
            "none";

    }

}


/* =========================================================
   EXPORT WEBSITE
   ========================================================= */

async function exportWebsite() {

    if (
        !window.JSZip
    ) {

        toast(
            "Please connect to the internet and try again."
        );

        return;

    }


    const zip =
        new JSZip();


    const uploads =
        zip.folder(
            "uploads"
        );


    const exportedFiles = [];


    const files =
        (
            await getAllFiles()
        )
        .sort(
            (a,b) =>
                String(a.id)
                .localeCompare(
                    String(b.id)
                )
        );


    for (
        const file of files
    ) {

        const safeName =
            file.name.replace(
                /[^\w.\-]+/g,
                "_"
            );


        const filename =
            `${file.id}-${safeName}`;


        uploads.file(
            filename,
            file.blob
        );


        exportedFiles.push({

            cat:
                file.cat,

            name:
                file.name,

            type:
                file.type,

            size:
                file.size,

            path:
                "uploads/" +
                filename

        });

    }


    /* PROFILE */

    const profile = {};


    document
        .querySelectorAll(
            "[data-k]"
        )
        .forEach(
            element => {

                profile[
                    element.dataset.k
                ] =
                    element.textContent.trim();

            }
        );


    /* PROFILE PHOTO */

    const profilePhoto =
        await getMeta(
            "profilePhoto"
        );


    if (
        profilePhoto
    ) {

        const extension =
            (
                profilePhoto.type
                .split("/")
                [1] ||
                "jpg"
            )
            .replace(
                "jpeg",
                "jpg"
            );


        const filename =
            "profile-photo." +
            extension;


        uploads.file(
            filename,
            profilePhoto
        );


        profile.pic =
            "uploads/" +
            filename;

    }


    /* CONTENT.JSON */

    zip.file(
        "content.json",

        JSON.stringify(
            {
                profile,
                files:
                    exportedFiles
            },

            null,
            2
        )
    );


    /* README */

    zip.file(
        "README-PUBLISH.txt",

`MY PORTFOLIO - PUBLISHING GUIDE

1. Unzip the exported ZIP file.

2. You will find:
   index.html
   style.css
   script.js
   content.json
   uploads/

3. Upload ALL of these files to GitHub.

4. Enable GitHub Pages.

5. Share your GitHub Pages URL.

Example:

https://yourusername.github.io/my-portfolio/

Anyone with the URL can view your portfolio.

IMPORTANT:
The public version is read-only.

If you change your portfolio:
1. Open the original portfolio on your computer.
2. Edit your information.
3. Upload your new files.
4. Click Export Site again.
5. Upload the new exported files to GitHub Pages.

GitHub Pages is static hosting.
It cannot automatically save browser uploads for every visitor.
For live online uploads, a backend such as Firebase or Supabase is required.
`
    );


    const blob =
        await zip.generateAsync(
            {
                type: "blob"
            }
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        URL.createObjectURL(
            blob
        );


    link.download =
        "my-portfolio-publish.zip";


    link.click();


    setTimeout(
        () =>
            URL.revokeObjectURL(
                link.href
            ),

        3000
    );


    toast(
        "Portfolio exported successfully!"
    );

}


/* EXPORT BUTTON */

$("#exp").onclick =
    exportWebsite;


/* =========================================================
   IMAGE LIGHTBOX
   ========================================================= */

$("#lb").onclick =
    () => {

        $("#lb")
            .classList
            .remove(
                "lbshow"
            );

    };


$("#lbClose").onclick =
    event => {

        event.stopPropagation();

        $("#lb").click();

    };


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            $("#lb").click();

        }

    }
);


/* =========================================================
   MOBILE MENU
   ========================================================= */

$("#menuBtn").onclick =
    () => {

        $("#menu")
            .classList
            .toggle(
                "open"
            );

    };


menu.addEventListener(
    "click",
    event => {

        if (
            event.target.tagName ===
            "A"
        ) {

            menu.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   TYPING ANIMATION
   ========================================================= */

const words = [

    "I build things for the web.",

    "I keep every quiz, exam and project here.",

    "Welcome to my portfolio."

];


let wordIndex = 0;

let characterIndex = 0;

let deleting = false;


function typingAnimation() {

    const element =
        $("#type");


    const word =
        words[wordIndex];


    element.textContent =
        word.slice(
            0,
            characterIndex
        );


    if (
        !deleting &&
        characterIndex ===
        word.length
    ) {

        deleting = true;

        setTimeout(
            typingAnimation,
            1600
        );

        return;

    }


    if (
        deleting &&
        characterIndex === 0
    ) {

        deleting = false;

        wordIndex =
            (
                wordIndex + 1
            )
            %
            words.length;

    }


    characterIndex +=
        deleting
            ? -1
            : 1;


    setTimeout(
        typingAnimation,

        deleting
            ? 25
            : 55
    );

}


typingAnimation();


/* =========================================================
   PARTICLES
   ========================================================= */

const canvas =
    $("#fx");


const context =
    canvas.getContext(
        "2d"
    );


let particles = [];


function resizeCanvas() {

    canvas.width =
        canvas.offsetWidth;

    canvas.height =
        canvas.offsetHeight;


    particles =
        Array.from(
            {
                length:
                    Math.min(
                        65,
                        Math.floor(
                            canvas.width / 16
                        )
                    )
            },

            () => ({

                x:
                    Math.random()
                    *
                    canvas.width,

                y:
                    Math.random()
                    *
                    canvas.height,

                vx:
                    (
                        Math.random()
                        - .5
                    )
                    *
                    .5,

                vy:
                    (
                        Math.random()
                        - .5
                    )
                    *
                    .5,

                radius:
                    Math.random()
                    *
                    2
                    +
                    1

            })

        );

}


resizeCanvas();


window.addEventListener(
    "resize",
    resizeCanvas
);


function particleAnimation() {

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    particles.forEach(
        (particle, index) => {

            particle.x +=
                particle.vx;

            particle.y +=
                particle.vy;


            if (
                particle.x < 0 ||
                particle.x >
                canvas.width
            ) {

                particle.vx *= -1;

            }


            if (
                particle.y < 0 ||
                particle.y >
                canvas.height
            ) {

                particle.vy *= -1;

            }


            context.fillStyle =
                "#4cc9ff";


            context.beginPath();


            context.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );


            context.fill();


            for (
                let i =
                    index + 1;

                i <
                    particles.length;

                i++
            ) {

                const other =
                    particles[i];


                const distance =
                    Math.hypot(
                        particle.x -
                        other.x,

                        particle.y -
                        other.y
                    );


                if (
                    distance < 120
                ) {

                    context.strokeStyle =
                        `rgba(
                            76,
                            201,
                            255,
                            ${
                                .15 *
                                (
                                    1 -
                                    distance /
                                    120
                                )
                            }
                        )`;


                    context.beginPath();


                    context.moveTo(
                        particle.x,
                        particle.y
                    );


                    context.lineTo(
                        other.x,
                        other.y
                    );


                    context.stroke();

                }

            }

        }
    );


    requestAnimationFrame(
        particleAnimation
    );

}


particleAnimation();


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target
                            .classList
                            .add("in");

                    }

                }
            );

        },

        {
            threshold: .08
        }

    );


document
    .querySelectorAll(
        ".rv"
    )
    .forEach(
        section =>
            revealObserver.observe(
                section
            )
    );


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

const navigationLinks =
    [
        ...menu.querySelectorAll(
            "a"
        )
    ];


const navigationObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        navigationLinks
                            .forEach(
                                link => {

                                    link.classList
                                        .toggle(
                                            "on",

                                            link.getAttribute(
                                                "href"
                                            )
                                            ===
                                            "#" +
                                            entry.target.id
                                        );

                                }
                            );

                    }

                }
            );

        },

        {
            rootMargin:
                "-45% 0px -50% 0px"
        }

    );


document
    .querySelectorAll(
        "header, section"
    )
    .forEach(
        section =>
            navigationObserver.observe(
                section
            )
    );


/* =========================================================
   SCROLL PROGRESS
   ========================================================= */

window.addEventListener(
    "scroll",

    () => {

        const percentage =
            scrollY /
            Math.max(
                1,

                document.documentElement
                    .scrollHeight
                -
                innerHeight
            )
            *
            100;


        $("#bar").style.width =
            percentage +
            "%";

    },

    {
        passive: true
    }

);


/* =========================================================
   MOUSE GLOW
   ========================================================= */

window.addEventListener(
    "pointermove",

    event => {

        if (
            window.innerWidth >
            700
        ) {

            $("#glow").style.left =
                event.clientX +
                "px";

            $("#glow").style.top =
                event.clientY +
                "px";

        }

    }
);


/* =========================================================
   LOAD CONTENT
   ========================================================= */

async function initialize() {

    await openDB();


    let publicContent =
        false;


    /*
       If content.json exists,
       the site is in PUBLIC mode.
    */

    try {

        const response =
            await fetch(
                "content.json",
                {
                    cache:
                        "no-store"
                }
            );


        if (
            response.ok
        ) {

            SITE =
                await response.json();

            publicContent =
                true;

        }

    }

    catch {}



    /*
       PUBLIC WEBSITE
    */

    if (
        publicContent
    ) {

        applyPublicContent();

        await renderFiles();

        return;

    }



    /*
       ADMIN / LOCAL WEBSITE
    */

    await loadText();

    await loadProfilePhoto();

    setupEditing();

    setupUploads();

    await renderFiles();

}


initialize();
```
