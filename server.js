const request = require('request');
const util = require('util');
const child_process = require(`child_process`);

const QL_ENV_HTTP_URL = 'http://127.0.0.1:5600/api/envs'
const QL_ENV_ENABLE_HTTP_URL = 'http://127.0.0.1:5600/api/envs/enable'

const requestPromise = util.promisify(request);
const exec = util.promisify(child_process.exec);

function getQlCookie() {
    var fs = require('fs'),
        path = require('path'),
        filePath = path.join('/ql/data/config', 'auth.json');
    var json = fs.readFileSync(filePath, { encoding: 'utf-8' });
    var author = JSON.parse(json);
    return author['token'];
}

async function enableQlEnvById(token, id) {
    let result = await requestPromise({
        url: QL_ENV_ENABLE_HTTP_URL,
        method: 'PUT',
        json: true,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: [id],
    });
    console.log(result.body)
    return result.body;
}

async function getJdWsck(token) {
    let result = await requestPromise({
        url: QL_ENV_HTTP_URL,
        method: 'GET',
        json: true,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        qs: {
            'searchValue': 'JD_WSCK',
        }
    });
    return result.body.data;
}

async function updateJdWsck(token, id, wsck) {
    let result = await requestPromise({
        url: QL_ENV_HTTP_URL,
        method: 'PUT',
        json: true,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: {
            'value': `pin=lanskytian;wskey=${wsck};`,
            'name': 'JD_WSCK',
            'id': id
        },
    });
    console.log(result.body)
    return result.body;
}

async function addJdWsck(token, wsck) {
    let result = await requestPromise({
        url: QL_ENV_HTTP_URL,
        method: 'POST',
        json: true,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: [{
            'value': `pin=lanskytian;wskey=${wsck};`,
            'name': 'JD_WSCK',
        }],
    });
    console.log(result.body)
    return result.body;
}

async function getJdCookie(token) {
    let result = await requestPromise({
        url: QL_ENV_HTTP_URL,
        method: 'GET',
        json: true,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        qs: {
            'searchValue': 'JD_COOKIE',
        }
    });
    return result.body.data;
}

async function updateJdCookie(token, id, pt_key) {
    let result = await requestPromise({
        url: QL_ENV_HTTP_URL,
        method: 'PUT',
        json: true,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: {
            'value': `pt_pin=lanskytian;pt_key=${pt_key};`,
            'name': 'JD_COOKIE',
            'id': id
        },
    });
    console.log(result.body)
    return result.body;
}

async function addJdCookie(token, pt_key) {
    let result = await requestPromise({
        url: QL_ENV_HTTP_URL,
        method: 'POST',
        json: true,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: [{
            'value': `pt_pin=lanskytian;pt_key=${pt_key};`,
            'name': 'JD_COOKIE',
        }],
    });
    console.log(result.body)
    return result.body;
}

// var token = getQlCookie();
// getJdWsck(token).then((data) => {
//     if(data && data[0]) {
//         console.log(data[0]['id'])
//         updateJdWsck(token, data[0]['id'], 'asdasdasdasd');
//         console.log('Update wsck wsck')
//     } else {
//         addJdWsck(token, 'wsck');
//         console.log('add wsck wsck')
//     }
// })

const express = require('express');
var app = express();
app.get('/jd', function (req, res) {
    if (!req.query) {
        return res.status(500).json({ message: 'wrong' });
    }
    var token = getQlCookie();
    if (req.query.wsck) {
        getJdWsck(token).then((envList) => {
            if (envList && envList[0]) {
                updateJdWsck(token, envList[0]['id'], req.query.wsck).then((result) => {
                    enableQlEnvById(token, envList[0]['id']).then((enable_data) => {
                        console.log(`after enable wsck, update cookie.`);
                        exec(`task shufflewzc_faker2_main/jd_wsck.py`);
                    });
                    return res.status(200).json({ message: `Update wsck succeed: ${JSON.stringify(result.data)}` });
                });
            } else {
                addJdWsck(token, req.query.wsck).then((result) => {
                    exec(`task shufflewzc_faker2_main/jd_wsck.py`);
                    return res.status(200).json({ message: `add wsck succeed: ${JSON.stringify(result.data)}` });
                });
            }
        })
    } else if(req.query.pt_key) {
        getJdCookie(token).then((envList) => {
            if (envList && envList[0]) {
                updateJdCookie(token, envList[0]['id'], req.query.pt_key).then((result) => {
                    enableQlEnvById(token, envList[0]['id']).then((enable_data) => {
                        console.log(`after enable jd_cookie, update cookie.`);
                    });
                    return res.status(200).json({ message: `Update pt_key succeed: ${JSON.stringify(result.data)}` });
                });
            } else {
                addJdCookie(token, req.query.pt_key).then((result) => {
                    return res.status(200).json({ message: `add pt_key succeed: ${JSON.stringify(result.data)}` });
                });
            }
        })
    }
    
});

app.listen(5701);