const util = require("util");
const child_process = require(`child_process`);
const notify = require("./sendNotify");

const exec = util.promisify(child_process.exec);

async function enableQlEnvById(id) {
    let result = await QLAPI.enableEnvs({ ids: [id] }).then((res) => {
        return res;
    });
    console.log(`enableQlEnvById ${id}: ${JSON.stringify(result)}`);
    return result;
}

async function getJdWsck() {
    let envs = await QLAPI.getEnvs({ searchValue: "JD_WSCK" }).then((res) => {
        return res.data;
    });
    console.log(`getJdWsck: ${JSON.stringify(envs)}`);
    return envs;
}

async function updateJdWsck(id, wsck) {
    let env_item = await QLAPI.updateEnv({
        env: {
            value: `pin=lanskytian;wskey=${wsck};`,
            name: "JD_WSCK",
            id: id,
        },
    }).then((res) => {
        return res.data;
    });
    console.log(`updateJdCookie ${JSON.stringify(env_item)}`);
    return env_item;
}

async function addJdWsck(wsck) {
    let envs = await QLAPI.createEnv({
        envs: [
            {
                value: `pin=lanskytian;wskey=${wsck};`,
                name: "JD_WSCK",
            },
        ],
    }).then((res) => {
        return res.data;
    });
    console.log(`addJdWsck ${envs[0].id}: ${envs[0].value}`);
    return envs;
}

async function getJdCookie() {
    let envs = await QLAPI.getEnvs({ searchValue: "JD_COOKIE" }).then((res) => {
        return res.data;
    });
    console.log(`getJdCookie: ${JSON.stringify(envs)}`);
    return envs;
}

async function updateJdCookie(id, pt_key) {
    let env_item = await QLAPI.updateEnv({
        env: {
            value: `pt_pin=lanskytian;pt_key=${pt_key};`,
            name: "JD_COOKIE",
            id: id,
        },
    }).then((res) => {
        return res.data;
    });
    console.log(`updateJdCookie ${JSON.stringify(env_item)}`);
    return env_item;
}

async function addJdCookie(pt_key) {
    let envs = await QLAPI.createEnv({
        envs: [
            {
                value: `pt_pin=lanskytian;pt_key=${pt_key};`,
                name: "JD_COOKIE",
            },
        ],
    }).then((res) => {
        return res.data;
    });
    console.log(`addJdCookie ${envs[0].id}: ${envs[0].value}`);
    return envs;
}

const express = require("express");
var app = express();
app.get("/jd", function (req, res) {
    if (!req.query) {
        return res.status(500).json({ message: "wrong" });
    }
    if (req.query.wsck) {
        getJdWsck().then((envList) => {
            if (envList && envList[0]) {
                updateJdWsck(envList[0]["id"], req.query.wsck).then((result) => {
                    enableQlEnvById(envList[0]["id"]).then((enable_data) => {
                        console.log(`after enable wsck, update cookie.`);
                        exec(`task shufflewzc_faker2_main/jd_wsck.py`);
                    });
                    return res.status(200).json({
                        message: `Update wsck succeed: ${JSON.stringify(result)}`,
                    });
                });
            } else {
                addJdWsck(req.query.wsck).then((result) => {
                    exec(`task shufflewzc_faker2_main/jd_wsck.py`);
                    return res.status(200).json({
                        message: `add wsck succeed: ${JSON.stringify(result)}`,
                    });
                });
            }
        });
    } else if (req.query.pt_key) {
        getJdCookie().then((envList) => {
            if (envList && envList[0]) {
                updateJdCookie(envList[0]["id"], req.query.pt_key).then((result) => {
                    enableQlEnvById(envList[0]["id"]).then(() => {
                        console.log(`after enable jd_cookie, update cookie.`);
                        notify.sendNotify("after enable jd_cookie, update cookie success.", `${JSON.stringify(result)}`, {});
                    });
                    return res.status(200).json({
                        message: `Update pt_key succeed: ${JSON.stringify(result)}`,
                    });
                });
            } else {
                addJdCookie(req.query.pt_key).then((result) => {
                    return res.status(200).json({
                        message: `add pt_key succeed: ${JSON.stringify(result)}`,
                    });
                });
            }
        });
    }
});

app.listen(5701);
