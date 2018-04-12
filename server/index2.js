var formidable = require('formidable'),
    http = require('http'),
    express = require('express'),
    util = require('util');
    var multer  = require('multer');
    var upload = multer({ dest: './pdfUpload' });

    var app = express();
    app.use(express.static('./pdfUpload/'));

    function makeForm(res){
      // show a file upload form
      res.writeHead(200, {'content-type': 'text/html'});
      if(true){
        res.end(
          '<script type="text/javascript">function sendAttachedPDF() {'+
            'var formData = new FormData(document.getElementById("form-pdf-upload"));'+
            'console.log("Send:"+document.getElementById("form-pdf-upload").pdf.files[0]);'+
            'console.log(formData);'+
            'const xhr = new XMLHttpRequest();'+
            'xhr.open(\'POST\', \'/api/uploadPDF\');'+
            //'xhr.setRequestHeader(\'Authorization\', `bearer ${Auth.getToken()}`);'+
            'xhr.responseType = \'json\';'+
            'xhr.addEventListener(\'load\', () => {'+
              'if (xhr.status === 200) {'+
              'console.log(xhr.status,xhr.response)'+
              '}else{'+
              'console.log(xhr.response)'+
              '}'+
            '});'+
            'xhr.upload.onprogress = function(e) {'+
                'if (e.lengthComputable) {'+
                  'var percentComplete = (e.loaded / e.total) * 100;'+
                  'console.log(percentComplete + \'% uploaded\');'+
                '}'+
            '};'+
            'xhr.send(formData);'+
          '}</script>'+
          '<div id="pdfUploadForm">'+
            '<form id="form-pdf-upload" name="form-pdf-upload" method="POST" encType="multipart/form-data">'+
              '<input type="hidden" name="test" value="testValue"/>'+
              '<input type="file" name="pdf" />'+
            '</form>'+
            '<button onClick="sendAttachedPDF()">Save</button>'+
          '</div>'
        );
     }else{
       res.end(
         '<form action="/api/uploadPDF" enctype="multipart/form-data" method="post">'+
         '  <input type="hidden" name="test" value="testValue"/>'+
         '  <input type="file" name="pdf" />'+
         '  <input type="submit" value="Upload">'+
         '</form>'
       );
     }
    }

    app.get('/', function (req, res, next) {
      makeForm(res);
    })

    app.get('/downloadFile', (req, res) => {
      console.log(req.query);
      console.log('router download:','/'+req.query.path, req.query.downloadname)
      res.setHeader('content-disposition', 'attachment;filename='+req.query.downloadname);
      res.download('.'+req.query.path, req.query.downloadname);
    });

    app.post('/api/uploadPDF', function (req, res, next) {
      console.log(req.files);
      var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
        console.log(util.inspect({fields: fields, files: files}));
      });
    });

app.listen(8081);
