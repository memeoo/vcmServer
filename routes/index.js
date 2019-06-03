var express = require('express');
var router = express.Router();
var mariadb  = require('mariadb/callback');
var multer = require('multer');
var fs = require('fs');

const SERVER_HOST = 'localhost'; 
const MYSQL_PORT = 3306; // DB SERVER PORT
var provId = ""; 

var configuration = {
  host: SERVER_HOST,
  user: 'memeoo',
  password: 'shsbsy70',
  port: MYSQL_PORT,
  database: 'vcm_prov'
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(" provId => ", providerId)
    cb(null, 'public/'+providerId+'/'+exid);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})


var upload = multer({ storage: storage });
var providerId = "";
var exid = 0;
class DB {
  constructor(config) {
      this.connection = mariadb.createConnection(config);
  }

  query(sql, args) {
      return new Promise((resolve, reject) => {
          this.connection.query(sql, args, (err, rows) => {
              if (err)
                  return reject(err);
              resolve(rows);
          });
      });
  }

  getQuery() {
      return this.connection;
  }

  close() {
      return new Promise((resolve, reject) => {
          this.connection.end(err => {
              if (err)
                  return reject(err);
              resolve();
          });
      });
  }
}

/* GET home page. */
router.get('/login', function(req, res, next) {
  let database = new DB(configuration);
  console.log(" try login !!!!");
  let id = req.query.id;
  let pass = req.query.pass;
  let loginQuery = "select mail, name from provider where userId='"+id+"' and password='"+pass+"'";
  let loginInfo = {
      userId : id,
      password: pass
  };
  
  provId = loginInfo.userId;

  database.query(loginQuery).then(result =>{
    console.log(" result => ", result);
    if(result.length == 0){
      console.log(" 아이디와 비밀번호를 다시 확인해 주세요 ");
      res.sendStatus(403);
      
    }else{
      console.log(" @@@@@ ")
      res.send(200, result);
    }
  }).catch(reject =>{
    console.log(" reject => ", reject);
  });
  
});

router.get('/getMeetings', function(req, res, next) {
  let database = new DB(configuration);
  console.log(" try login !!!!");
  let uploader = req.query.id;
  let selectQuery = "select * from meeting where uploader='"+uploader+"'";
  
  database.query(selectQuery).then(result =>{
    console.log(" result => ", result);

    res.send(200, result);
  }).catch(reject =>{
    console.log(" reject => ", reject);
  });
  
});


router.post('/signup', function(req, res, next) {
    let database = new DB(configuration);
    console.log(" try sign up !!!!");
    console.log(" req => ", req.body);
    console.log(" req => ", req.body.id);
    console.log(" req => ", req.body.pass);

    let data = {
      'userId':req.body.id,
      'password': req.body.pass,
      'name': req.body.name,
      'mail': req.body.smail,
    };

    // let insertQuery = "INSERT INTO provider set ?";
    let insertQuery = "INSERT INTO provider (userId, password, name, mail) VALUES ('"+data.userId+"','"+data.password+"','"+data.name+"','"+data.mail+"')";
    database.query(insertQuery).then(rows =>{
      console.log(" rows => ", rows);
      res.send("Insert Succeed!");
    }, err =>{
      console.log(" err => ", err);
    });

  });

  router.post('/saveMeeting', function(req, res, next) {
    let database = new DB(configuration);
    console.log(" Save Meeting !!");
    console.log(" req => ", req.body);
    let data = {
      'mtNm':req.body.mtNm,
      'orgNm': req.body.orgNm,
      'mtCont': req.body.mtCont,
      'mtCondition': req.body.mtCondition,
      'mtEtc':req.body.mtEtc,
      'mtMoney': req.body.mtMoney,
      'orgPlace': req.body.orgPlace,
      'uploader': req.body.uploader,
      'startTime': req.body.timeStart,
      'endTime': req.body.timeEnd,
      'date': req.body.date,
    };    
    let insertQuery = "";
    if(exid == 0){
      insertQuery = 
      "INSERT INTO meeting (mtName, orgName, mtContent, mtQualify, mtEtc, mtMoney, mtAddress, uploader, startTime, endTime, mtDay)"+ 
      "VALUES ('"+data.mtNm+"','"+data.orgNm+"','"+data.mtCont+"','"+data.mtCondition+"', '"+data.mtEtc+"','"+data.mtMoney+"','"+data.orgPlace+"','"+data.uploader+"','"+data.startTime+"','"+data.endTime+"','"+data.date+"')";
    }else{
      insertQuery = 
      "UPDATE meeting SET(mtName, orgName, mtContent, mtQualify, mtEtc, mtMoney, mtAddress, uploader, startTime, endTime, mtDay) ="+
      "('"+data.mtNm+"','"+data.orgNm+"','"+data.mtCont+"','"+data.mtCondition+"', '"+data.mtEtc+"','"+data.mtMoney+"','"+data.orgPlace+"','"+data.uploader+"','"+data.startTime+"','"+data.endTime+"','"+data.date+"')"+ 
      "WHERE examId = '"+exid+"'";
    }

    database.query(insertQuery).then(rows =>{
      console.log(" rows => ", rows);
      exid = rows.insertId;
      res.status(200).send("Insert Succeed!");
    }, err =>{
      console.log(" err => ", err);
    });
  });
  
  // router.post('/saveFile', upload.fields(fileNames), function(req, res, next){
  //   console.log(" Files @@ => ", req.files);
  //   res.send("Uploaded !! ");
  // });
 
module.exports = router;
