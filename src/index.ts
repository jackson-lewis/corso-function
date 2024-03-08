import { http } from '@google-cloud/functions-framework'

http('helloWorld', function (req, res) {
    res.send(`Hello world to you ${req.query.name}`)
})
