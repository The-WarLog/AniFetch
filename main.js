const server = require('./api/index.js');
const port = process.env.PORT || 3000;
server.listen(port,()=>{
    console.log(`Server listening at the port ${port}  localhost:${port}`);
});