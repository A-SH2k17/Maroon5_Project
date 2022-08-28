if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config({path:'.env'})
}

const stripeSecreteKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
console.log("server is live")
const express = require('express')
const app = express()
const stripe = require('stripe')(stripeSecreteKey)
const fs = require('fs')
/*
this is the same as setting up the sever but in a more complex way. the simpler way is:
const http = require('http')
const port = 3000

const server = http.createServer(function(req,res)){

}

serve.listen(port,function(error){

})
*/ 

app.set('view engine','ejs')
app.use(express.json())
app.use(express.static('public'))//marks all the files in the public folder
app.listen(3000)

app.get('/store',function(req,res){
    fs.readFile('items.json',function(error,data){
        if(error){
            res.status(500).end()
        }else{
            res.render('index.ejs',{
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
})

app.post('/purchase', function(req, res) {
    fs.readFile('items.json', function(error, data) {
      if (error) {
        res.status(500).end()
      } else {
        const itemsJson = JSON.parse(data)
        const itemsArray = itemsJson.music.concat(itemsJson.merch)
        let total = 0
        req.body.items.forEach(function(item) {
          const itemJson = itemsArray.find(function(i) {
            return i.id == item.id
          })
          total = total + itemJson.price * item.quantity
        })
  
        stripe.charges.create({
          amount: total,
          source: req.body.stripeTokenId,
          currency: 'usd'
        }).then(function() {
          console.log('Charge Successful')
          res.json({ message: 'Successfully purchased items' })
        }).catch(function() {
          console.log('Charge Fail')
          res.status(500).end()
        })
      }
    })
  })