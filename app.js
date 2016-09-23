const express = require('express')
const cheerio = require('cheerio')
const superagent = require('superagent')
const url = require('url')
const promise = require('promise')

const app = express()
const urlHtml = 'https://cnodejs.org/'

app.get('/', (req, res, next) => {
    superagent.get(urlHtml)     //CNode community
        .end((err, resource) => {
            if (err) {
                return next(err)
            }
            //res.text is html from urlHtml
            let $ = cheerio.load(resource.text)
            let items = []
            $('#topic_list .topic_title').each((i, element) => {
                let $element = $(element)
                items.push({
                    title: $element.attr('title'),
                    href: $element.attr('href')
                })
            })
            res.send(items)
        })
})

app.get('/async', (req, res, next) => {
    superagent.get(urlHtml)
        .end((err, resource) => {
            if (err) {
                return console.error(err)
            }
            let topicUrls = []
            let $ = cheerio.load(resource.text)
            $('#topic_list .topic_title').each((index, element) => {
                //element  对象   [object]
                //${element} 对象数据   [data]
                let $element = $(element)
                let href = url.resolve(urlHtml, $element.attr('href'))
                topicUrls.push(href)
            })
            topicUrls.forEach(function (element, index) {
                superagent.get(element)
                    .end((err, sres) => {
                        async(sres.text, index)
                            .then(data => {
                                console.log("index: " + index + '\r\n' + data + '\r\n')
                            }).catch(e => console.log(e))
                    })
            })
        })
})

let async = (html, index) => {
    return new Promise((resolve, reject) => {
        let $ = cheerio.load(html)
        let title = $('.topic_full_title').text().trim()
        let comment = $('.reply_content').eq(0).text().trim()
        resolve("title: " + title + "\r\n" + "comment: " + comment)

    })
}

app.listen(3000, () => {
    console.log("service start success...")
})