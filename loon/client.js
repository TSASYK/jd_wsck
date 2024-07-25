const req = $request;

console.log('This is a log');
console.log(req.method);
if (req.method != 'OPTIONS' && req.headers && req.headers.Host == 'api.m.jd.com') {
    // const cookieVal = "wskey=AAJlSvaNAECkCJQWndDTdb618CzpBqt-5g2pa5GahrXZEC8BIM4dKbSR0aT3cu9kWqYgefe1xFHAZ5FqSMREbOYM-RdfOUEg;whwswswws=~AAsQhybeLEaA6kRGifkyr6MOU36X5hVWeFDTufwAAAApsYW5za3l0aWFu"
    const cookieVal = (req.headers['Cookie'] || req.headers['cookie'] || '');
    const ckItems = cookieVal.match(/wskey=(.+?);/);
    console.log(ckItems);
    if (ckItems && ckItems.length == 2) {
        $httpClient.get(`http://192.168.50.3:15307/jd?wsck=${ckItems[1]}`, function (error, response, data) {
            console.log(data);
        });
    }
    const ptItems = cookieVal.match(/pt_key=(.+?);/);
    console.log(ptItems);
    if (ptItems && ptItems.length == 2) {
        $httpClient.get(`http://192.168.50.3:15307/jd?pt_key=${ptItems[1]}`, function (error, response, data) {
            console.log(data);
        });
    }
} else {
    throw new Error("req wrong");
}