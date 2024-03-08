import { http } from '@google-cloud/functions-framework'

http('helloWorld', (req, res) => {
    res.send(`Hello world ${req.query.name}`)
})
