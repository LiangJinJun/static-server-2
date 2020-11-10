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

    const session = JSON.parse(fs.readFileSync('./session.json').toString())

        if(path==='/sign_in'&& method==='POST'){
            const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
            const array=[]
            request.on('data',chunk=>{
                array.push(chunk)
            })
            request.on('end',()=>{
                const string= Buffer.concat(array).toString()
                const obj = JSON.parse(string)
                const user =userArray.find((user)=>user.name===obj.name&&user.password===obj.password)
                if(user===undefined){
                    response.statusCode=400
                    response.setHeader('Content-Type','text/json;charset=utf-8')
                    response.end(`{"errorCode":4001}`)
                }else {
                    response.statusCode=200
                    const random = Math.random()
                    
                    session[random]={user_id:user.id}
                    fs.writeFileSync('./session.json',JSON.stringify(session))
                    response.setHeader('Set-Cookie',`session_id=${random};HttpOnly`)
                    response.end()
                }
            });
        }else if(path==='/home.html'){
                const cookie = request.headers["cookie"]
                let sessionId
                try{
                    console.log(cookie.split(';').filter(s=>s.indexOf('session_id=')>=0)[0].split('=')[1]);
                    sessionId =cookie.split(';').filter(s=>s.indexOf('session_id=')>=0)[0].split('=')[1];
                }catch(error){

                }
                if (sessionId && session[sessionId]){
                    const userId = session[sessionId].user_id
                    const userArray = JSON.parse(fs.readFileSync('./db/users.json'))/* userArray就是所有的意思 */
                    const user =  userArray.find(user=>user.id===userId)
                    const homeHtml = fs.readFileSync("./public/home.html").toString();
                    let string=''
                    if(user){
                        string= homeHtml.replace('{{loginStatus}}','已登录').replace('{{user.name}}',user.name)
                    }
                    response.write(string);
                }else {
                    const homeHtml = fs.readFileSync("./public/home.html").toString();
                    const string= homeHtml.replace('{{loginStatus}}','未登陆').replace('{{user.name}}','')
                    response.write(string);
                }
                // console.log(cookie);
                 response.end('home')
        }else if(path==="/register"&&method==="POST"){
            response.setHeader('Content-Type','text/html;charset=utf-8')
            const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
            const array=[]
            request.on('data',(chunk)=>{
                array.push(chunk)
            })
            request.on('end',()=>{
                const string= Buffer.concat(array).toString()
                const obj = JSON.parse(string)
                const lastUser= userArray[userArray.length-1];
                const newUser =  {
                    /* id 为最后一个用户的id+1 */
                    id: lastUser?lastUser.id+1:1,
                    name:obj.name,
                    password:obj.password
                }
                userArray.push(newUser)
                fs.writeFileSync('./db/users.json',JSON.stringify(userArray))
                response.end()
            })
        }else{
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
            response.end();
        }

     
    

    /******** main end ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功！请输入下列地址访问\nhttp://localhost:' + port)