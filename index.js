var http = require('http')
  , path = require('path')
  , url = require('url')
  , fs = require('fs')

var dir = path.join( process.cwd(), process.argv[2] || '' )
  , port = parseInt(process.argv[3]) || 8080



// problem with nproxy
// dont support relative path
// dont support SSL
// must need map file
// map file name and easy format: yml or json?

// TODO
// alternative proxy features?
//
// use .stab.json or stab.yml?
// /abc/ for regex
// *abc  for wildchar
// absolute replace ?: baidu.com/file file A , A standfor absolute, R standfor Regexp
// quick cli replace : stab baidu.com/file file or stab baidu.com/ ./ (dir replace)

// rules
// "file1 > ./file2, dir/ > ./"

// problem cache? disable cache
http.createServer(function(req, res) {
    var info = url.parse(req.url, true)

    var uri = info.pathname
      , filepath = path.join(dir, uri)
      , delay = info.query.delay

    var log = 'Request: ' +filepath
    if ( isFinite(delay) ) {
        log += ' with Delay ' +delay +'ms'
    }
    console.log(log)

    // res.setHeader('Access-Control-Allow-Origin', '*')
    fs.stat(filepath, function(err, stats) {
        if (err) {
            res.writeHead(404)
            res.end('404')
            return
        }

        if (stats.isFile()) {
            res.writeHead(200, {
                'Content-Type' :
                    (function () { // mimeType
                        switch (path.extname(filepath).slice(1)) {
                        case 'html' :
                            return 'text/html'
                        case 'xml' :
                            return 'text/xml'
                        case 'css' :
                            return 'text/css'
                        case 'js' :
                            return 'text/javascript'
                        case 'jpg' :
                            return 'image/jpg'
                        case 'gif' :
                            return 'image/gif'
                        case 'png' :
                            return 'image/png'
                        default :
                            return 'text/plain'
                        }
                    })()
            })
            if ( isFinite(delay) ) {
                setTimeout(function () {
                    fs.createReadStream(filepath).pipe(res)
                }, delay)
            } else {
                fs.createReadStream(filepath).pipe(res)
            }
        } else if (stats.isDirectory()) {
            fs.readdir(filepath, function (err, files) {
                res.writeHead(200, {'Content-Type' : 'text/html'})
                res.write('<!DOCTYPE html><html><body><h1>Directory ' +uri +'</h1><ul>')
                files.forEach(function (name, i) {
                    res.write('<li><a href="' +path.join(uri, name) +'">' +name +'</a></li>')
                })
                res.end('</ul></body></html>')
            })
        } else {
            res.end('WTF!!')
        }
    })
}).listen(port)

console.log('Server running in "' +dir +'" on port: ' +port)