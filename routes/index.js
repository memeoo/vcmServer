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

// ============= Mobile =================================
router.get('/loginMobile', function(req, res, next) {
  let database = new DB(configuration);
  console.log(" try login !!!!");
  let id = req.query.id;
  let pass = req.query.pass;
  let loginQuery = "select mId, mPass from member where mId='"+id+"' and mPass='"+pass+"'";
  
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

router.post('/memberSignup', function(req, res, next) {
  let database = new DB(configuration);
  console.log(" try sign up !!!!");
  console.log(" req => ", req.body);
  console.log(" req => ", req.body.id);
  console.log(" req => ", req.body.pass);

  let data = {
    'mId':req.body.id,
    'mPass': req.body.pass,
    'mName': req.body.realName,
    'mMail': req.body.email,
    'mPhoneNum': req.body.phoneNum,
    'mCompany': req.body.company,
    'mPosition': req.body.position,
  };

  // let insertQuery = "INSERT INTO provider set ?";
  let insertQuery = "INSERT INTO member (mId, mPass, mName, mMail, mPhoneNum, mCompany,mPosition ) VALUES ('"+data.mId+"','"+data.mPass+"','"+data.mName+"','"+data.mMail+"','"+data.mPhoneNum+"','"+data.mCompany+"','"+data.mPosition+"')";
  database.query(insertQuery).then(rows =>{
    console.log(" rows => ", rows);
    res.send("Insert Succeed!");
  }, err =>{
    console.log(" err => ", err);
  });

});

router.get('/getMobileMeetings', function(req, res, next) {
  let database = new DB(configuration);
  console.log(" get Meetings which are submitted ");
  // 오늘보다 크고(미래) 27일후(오늘포함 4주후) 보다 작은 날짜들만 가져옴. 
  let selectQuery = "select * from meeting where isSubmit='YES' and mtDay >= (NOW()) and mtDay <= (NOW() + INTERVAL 27 DAY) ORDER BY mtDay";
  
  database.query(selectQuery).then(result =>{
    console.log(" result => ", result);
    // res.status(200).json(result);
    res.status(200).send(result);

  }).catch(reject =>{
    console.log(" reject => ", reject);
  });
  
});

router.get('/getMobileMember', function(req, res, next) {
  let database = new DB(configuration);
  console.log(" get Member data of Mobile");
  let userId = req.query.id;
  let selectQuery = "select mName, mCompany, mPosition, mEtc, mMail, mPhoneNum from member where mId='"+userId+"'";
  
  database.query(selectQuery).then(result =>{
    console.log(" result => ", result);
    // res.status(200).json(result);
    res.status(200).send(result);

  }).catch(reject =>{
    console.log(" reject => ", reject);
  });
  
});

router.post('/applyMobile', function(req, res, next) {
  let database = new DB(configuration);
  console.log(" Apply Mobile !!");
  console.log(" req => ", req.body);

  let data = {
    'vcId':req.body.vcId,
    'mtId': req.body.mtId,
    'appeal': req.body.appeal,
    'provId' : req.body.provId,
    'vcName':req.body.vcName,
    'vcCompany': req.body.vcCompany,
    'vcPosition': req.body.vcPosition,
    'vcEtc' : req.body.vcEtc,
    'vcMail': req.body.vcMail,
    'vcPhoneNum' : req.body.vcPhoneNum,
  };

  console.log(" data => ", data);
  // let insertQuery = "INSERT INTO provider set ?";
  let insertQuery = "INSERT INTO apply (vcId, mtId, appeal, provId, vcName, vcCompany, vcPosition, vcEtc, vcMail, vcPhoneNum) VALUES" + 
                    "('"+data.vcId+"','"+data.mtId+"','"+data.appeal+"','"+data.provId+"','"+data.vcName+"','"+data.vcCompany+"','"+data.vcPosition+"','"+data.vcEtc+"','"+data.vcMail+"','"+data.vcPhoneNum+"')";
  database.query(insertQuery).then(rows =>{
    console.log(" rows => ", rows);
    res.status(200).send(rows);
  }, err =>{
    console.log(" err => ", err);
  });

});


// ======= Provider Web ====================================================

router.get('/getApply', function(req, res, next) {
  let database = new DB(configuration);
  console.log(" Get Apply !! ");
  let vcId = req.query.vcId;
  let mtId = req.query.mtId;
  let selectQuery = "select * from apply where vcId='"+vcId+"' and mtId='"+mtId+"'";
  
  database.query(selectQuery).then(result =>{
    console.log(" result => ", result);
    // res.status(200).json(result);
    res.status(200).send(result);

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
    // res.status(200).json(result);
    res.status(200).send(result);

  }).catch(reject =>{
    console.log(" reject => ", reject);
  });
  
});

router.get('/getApplied', function(req, res, next) {
  let database = new DB(configuration);
  console.log(" get Applied !!");
  let provId = req.query.provId;
  let selectQuery = "select * from apply where provId='"+provId+"'";
  
  database.query(selectQuery).then(result =>{
    console.log(" result => ", result);
    // res.status(200).json(result);
    res.status(200).send(result);

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
      'phoneNum': req.body.phoneNumber,
    };

    // let insertQuery = "INSERT INTO provider set ?";
    let insertQuery = "INSERT INTO provider (userId, password, name, mail, phoneNum) VALUES ('"+data.userId+"','"+data.password+"','"+data.name+"','"+data.mail+"','"+data.phoneNum+"')";
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
      'insertOrUpdate': req.body.insertOrUpdate,
      'mtKind': req.body.mtKind,
      'mtArea' : req.body.mtArea,
      'isSubmit': req.body.isSubmit,
    };    
    let insertQuery = "";
    
    if(data.insertOrUpdate == "insert"){
      insertQuery = 
      "INSERT INTO meeting (mtName, orgName, mtContent, mtQualify, mtEtc, mtKind, mtArea, mtMoney, mtAddress, uploader, startTime, endTime, mtDay, isSubmit)"+ 
      " VALUES ('"+data.mtNm+"','"+data.orgNm+"','"+data.mtCont+"','"+data.mtCondition+"', '"+data.mtEtc+"','"+data.mtKind+"', '"+data.mtArea+"', '" +data.mtMoney+"','"+data.orgPlace+"','"+data.uploader+"','"+data.startTime+"','"+data.endTime+"','"+data.date+",'"+data.isSubmit+"')";
    }else{
      let meetingId = req.body.mtId;
      console.log(" meetingId => ", meetingId);
      insertQuery = 
      "UPDATE meeting SET mtName = '"+data.mtNm+"', orgName = '"+data.orgNm+"', mtContent = '"+data.mtCont+"', mtQualify = '"+data.mtCondition+ 
      "', mtEtc = '"+data.mtEtc+"', mtKind = '"+data.mtKind+"', mtArea = '"+data.mtArea+"', mtMoney = '"+data.mtMoney+"', mtAddress = '"+data.orgPlace+
      "', uploader = '"+data.uploader+"', startTime = '"+data.startTime+"', endTime = '"+data.endTime+"', mtDay = '"+data.date+"', isSubmit = '"+data.isSubmit+ 
      "' WHERE mtId = '"+meetingId+"'";
    }

    console.log(" QUERY ==> ", insertQuery);

    database.query(insertQuery).then(rows =>{
      console.log(" rows => ", rows);
      let insertedMeetingId = rows.insertId;
      res.status(200).send(data.uploader);
    }, err =>{
      console.log(" err => ", err);
    });
  });
  
  router.post('/submitMeeting', function(req, res, next) {
    let database = new DB(configuration);
    console.log(" Submit Meeting !!");
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
      'isSubmit': req.body.isSubmit,
      'insertOrUpdate': req.body.insertOrUpdate,
      'mtKind': req.body.mtKind,
      'mtArea' : req.body.mtArea,
    };    
    console.log(" data => ", data);
    let insertQuery = "";
    if(data.insertOrUpdate == "insert"){
      insertQuery = 
      "INSERT INTO meeting (mtName, orgName, mtContent, mtQualify, mtEtc, mtKind, mtArea, mtMoney, mtAddress, uploader, startTime, endTime, mtDay, isSubmit)"+ 
      "VALUES ('"+data.mtNm+"','"+data.orgNm+"','"+data.mtCont+"','"+data.mtCondition+"', '"+data.mtEtc+"', '"+data.mtKind+"', '"+data.mtArea+"', '"+data.mtMoney+"','"+data.orgPlace+"', '"+data.uploader+"', '"+data.startTime+"','"+data.endTime+"','"+data.date+"','"+data.isSubmit+"')";
    }else{
      let meetingId = req.body.mtId;
      insertQuery = 
      "UPDATE meeting SET mtName = '"+data.mtNm+"', orgName = '"+data.orgNm+"', mtContent = '"+data.mtCont+"', mtQualify = '"+data.mtCondition+ 
      "', mtEtc = '"+data.mtEtc+"', mtKind = '"+data.mtKind+"', mtArea = '"+data.mtArea+"', mtMoney = '"+data.mtMoney+"', mtAddress = '"+data.orgPlace+
      "', uploader = '"+data.uploader+"', startTime = '"+data.startTime+"', endTime = '"+data.endTime+"', mtDay = '"+data.date+"', isSubmit = '"+data.isSubmit+ 
      "' WHERE mtId = '"+meetingId+"'";
    }
    
    console.log(" QUERY ==> ", insertQuery);

    database.query(insertQuery).then(rows =>{
      console.log(" rows => ", rows);
      console.log(" data.uploader => ", data.uploader);
      exid = rows.insertId;
      res.status(200).send(data.uploader);
    }, err =>{
      console.log(" err => ", err);
    });
  });
 
module.exports = router; 
