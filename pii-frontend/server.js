const express = require('express');
const request = require('request');
const app = express();
const port = process.env.PORT || 5000;

const PII_URL = 'http://172.31.13.194:7000/analyze';
//const PII_URL = 'https://localhost:7000/analyze';

app.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.json())

app.post('/pii', (req, res) => {
    console.log(req)
    console.log('sending request')
    request({
        method: 'POST',
        url: PII_URL,
        json: true,
        body: req.body
      }, function (err, r) {
        if (err) return console.error(err.message);
        console.log(r)
        // console.log(r.body);
        res.send(r.body);
      });
});
