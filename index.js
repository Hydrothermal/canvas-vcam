require("./app/db.js").initialize().then(() => {
    require("./app/window");
});