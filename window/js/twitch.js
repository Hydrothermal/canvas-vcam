const valid_hats = decodeURIComponent(document.URL.match(/hats=([^&]+)/)[1]).split(";");

const client = new tmi.client({
    identity: {
        username: BOT_USERNAME,
        password: OAUTH_TOKEN
    },
    channels: [CHANNEL_NAME]
});

function message(target, context, message, self) {
    const reward = context["custom-reward-id"];

    switch(reward) {
        // change hat
        case "c80da6ef-be40-4cb3-aa12-091b9ecf5b48":
        if(message && valid_hats) {
            let hat_index;

            for(let i = 0; i < valid_hats.length; i++) {
                if(message.replace(/ /g, "").includes(valid_hats[i].replace(/ /g, ""))) {
                    hat_index = i;
                    break;
                }
            }

            if(hat_index > -1) {
                setHat(null, hat_index);
            }
        }
        break;
    }
}

client.on("message", message);
client.on("connected", () => {
    console.log("bot connected");
});

client.connect();