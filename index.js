var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
const puppeteer = require('puppeteer');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
//app.listen(process.env.PORT || 3000);
app.listen(3000);

app.get("/", function (req, res) {
    res.redirect("/baogia")
});

app.get("/baogia", function (req, res) {
    res.render("home")
});

app.post("/baogia", function (req, res) {
    // var ve={
    //     DEP=req.body.DEP,
    //     ARR=req.body.ARR,
    //     STD=req.body.STD,
    //     STA=req.body.STA
    // }

    const DEP = req.body.DEP;
    const ARR = req.body.ARR;
    const STD = req.body.STD;
    const ATD = req.body.STA;
    //console.log(req.body.DEP);


    (async () => {

        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        //page.setViewport({ width: 400, height: 811 });      
        await page.goto('https://onlineticket.com.vn/', { waitUntil: 'networkidle2' });
        await page.type('#Email', 'KH03099', { delay: 100 }); // Types slower, like a user
        await page.type('#Password', '@Kienan09', { delay: 100 }); // Types slower, like a user
        await page.click('#sblogin', { waitUntil: 'networkidle0' }) // some button that triggers file selection

        await page.waitForNavigation({ waitUntil: 'networkidle0' })
        await page.goto('https://onlineticket.com.vn/probooking', { waitUntil: 'networkidle0' });

        await page.click('#RoundTrip') // some button that triggers file selection
        await page.$eval('input[name="Flight[0].departurecode"]', (el, dep) => el.value = dep, DEP);
        await page.$eval('input[name="Flight[0].arrivalcode"]', (el, arr) => el.value = arr, ARR);
        await page.$eval('input[name="Flight[0].departuredate"]', (el, std) => el.value = std, STD);
        await page.$eval('input[name="Flight[0].arrivaldate"]', (el, atd) => el.value = atd, ATD);

        await page.click('input[value="Tìm chuyến bay"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 3000000 })
        await page.screenshot({ path: 'VNA.png' });
        await page.screenshot({ path: 'FULL.png', fullPage: true });

        const giadi = await page.evaluate(() => {
            let chuyendi = document.querySelectorAll('#List-result0 .listFlight .itemRow');
            chuyendi = [...chuyendi];
            let giadi = chuyendi.map(link => ({
                Giave: link.innerText
            }));

            let giadiTemp = [];
            //giadiTemp.push(DEP + "-" + ARR + ", " + STD)
            var stt = 0;
            giadi.forEach(function (gv) {
                stt = stt + 1;
                gv = gv.Giave;
                var giave = "";
                gv = gv.replace("\n", "");
                gv = gv.replace("\n", "");
                gv = gv.replace("\n", "");
                gv = gv.replace("\n", "AVIVU");
                giave = stt + ". " + (gv.slice(gv.indexOf("AVIVU") + 5)).slice(0, 2) + " " + gv.slice(0, 5) + " gia: " + gv.slice(gv.lastIndexOf("\n") + 1) + "d";
                giadiTemp.push(giave)
            })
            return giadiTemp;
        });

        await page.click('a[href="#tab_1"]');

        const giart = await page.evaluate(() => {
            let chuyenve = document.querySelectorAll('#List-result1 .listFlight .itemRow');
            chuyenve = [...chuyenve];
            let giart = chuyenve.map(link => ({
                Giave: link.innerText
            }));

            let giartTemp = [];
            var stt = 0;
            giart.forEach(function (gv) {
                stt = stt + 1;
                gv = gv.Giave;
                var giave = "";
                gv = gv.replace("\n", "");
                gv = gv.replace("\n", "");
                gv = gv.replace("\n", "");
                gv = gv.replace("\n", "AVIVU");
                giave = stt + ". " + (gv.slice(gv.indexOf("AVIVU") + 5)).slice(0, 2) + " " + gv.slice(0, 5) + " gia: " + gv.slice(gv.lastIndexOf("\n") + 1) + "d";
                giartTemp.push(giave)
            })

            return giartTemp;
        });

        console.log(giadi);
        console.log(giart);
        await browser.close();
        res.send(giadi);
    })();

})