var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请输入指定端口。如：\nnode server.js 8888')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) {
        queryString = pathWithQuery.substring(pathWithQuery.indexOf('?'))
    }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** main start ************/

    console.log('有小可爱访问服务器。路径（带查询参数）为：' + pathWithQuery)

   
        response.statusCode = 200
        const filePath = path ==='/'?'/index.html':path
        const index= filePath.lastIndexOf('.')
        /* suffix是后缀 */
        const suffix = filePath.substring(index)
        const fileTypes={
            '.html':'text/html',
            '.css':'text/css',
            '.js':'javascript',
            '.png':'image/png',
            '.jpg':'image/jpeg'
        }
        response.setHeader('Content-Type', `${fileTypes[suffix] || 'text/html'};charset=utf-8`)
        console.log(suffix);
        let content 
        try{
            content= fs.readFileSync(`./public${filePath}`)
        }catch(error){
            content='文件不存在'
            response.statusCode=404
        }
        response.write(content) /* 由于content会报错，所以把赋值单独写出来 */
        response.end()
    

    /******** main end ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功！请输入下列地址访问\nhttp://localhost:' + port)