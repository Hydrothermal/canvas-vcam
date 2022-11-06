const path = require("path");
const { existsSync } = require("fs");
const fs = require("fs").promises;

const APPDATA = process.env.LOCALAPPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
const data_folder = path.join(APPDATA, "canvas-vcam");
const data_file = path.join(data_folder, "data.json");
let data;

async function save() {
    await fs.writeFile(data_file, JSON.stringify(data, null, 4));
    console.log("saved");
}

async function createDataFile() {
    console.log("creating data file");
    data = {};
    save();
}

async function readDataFile() {
    if(!existsSync(data_file)) {
        createDataFile();
    } else {
        const buffer = await fs.readFile(data_file);

        // parse json and recreate if malformed
        try {
            data = JSON.parse(buffer.toString());
        } catch(e) {
            console.log("malformed data!");
            createDataFile();
        }

        console.log("loaded data:", data);
    }

    module.exports.data = data;
    return data;
}

async function initialize() {
    if(!existsSync(data_folder)) {
        console.log("creating data folder");
        await fs.mkdir(data_folder);
    }

    return readDataFile();
}

module.exports = { initialize, save };