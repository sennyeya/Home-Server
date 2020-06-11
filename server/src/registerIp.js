const express = require('express')
const app = express()
const fs = require('fs')
const cors = require('cors')

app.use(cors())

app.set('trust proxy', true)

app.get('/register_ip', (req, res)=>{
    fs.readFile('known_hosts.txt', function (err, data) {
        console.log(err, data)
        if (err) {
            return res.sendStatus(400);
        }
        let hosts = data.toString().split("\n");
        let address = req.ip.substring(req.ip.lastIndexOf(":")+1);
        console.log(address)
        if(hosts.indexOf(address) === -1){
            let stream = fs.createWriteStream('known_hosts.txt', {flags:'a'});
            stream.write(address+"\n");
            stream.end(()=>{
                res.sendStatus(200)
            });
        }else{
            res.sendStatus(200);
        }
      });
})

app.listen(4001, ()=>{
    console.log("ip registerer listening on 4001")
})