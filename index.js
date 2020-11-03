require('dotenv').config()
const axios = require('axios')
const express = require('express');
const app = express()
const {IncomingWebhook} = require('@slack/webhook')
const url = process.env.SLACK_WEBHOOK_URL
console.log({url})
const webhook = new IncomingWebhook(url);

const cors = require('cors')

app.use(cors())

app.get('/',(req, res) => {
  res.send('working')
})



async function getAirpodDataFromVerkkokauppa() {
  const airPodsResponse = await axios.get('https://web-api.service.verkkokauppa.com/products/539594')
  const airPodsProResponse = await axios.get('https://web-api.service.verkkokauppa.com/products/588886')
  return {
    airPodsProResponse,
    airPodsResponse
  }
}

getAirpodDataFromVerkkokauppa().then(async(response) => {
  console.log({response})
  const airPodsProPrice = response.airPodsProResponse.data.map((item) => item.price)
  const airPodsPrice = response.airPodsResponse.data.map((item) => item.price)
  const currentAirPodsProPrice = airPodsProPrice[0].current
  const currentAirPodsPrice = airPodsPrice[0].current
  const proDiscountAmount = airPodsProPrice[0].discountAmount
  const discountAmount = airPodsPrice[0].discountAmount
  if(currentAirPodsProPrice < 209) {
    try {
      await webhook.send({
        text: `AirpodsPro: ${currentAirPodsProPrice}, discountAmount: ${proDiscountAmount}`,
      });
    } catch (error) {
      console.log(error)
    }
  }
  if(currentAirPodsPrice < 129) {
    try {
      await webhook.send({
        text: `Airpods: ${currentAirPodsPrice}, discountAmount: ${discountAmount}`,
      });
    } catch (error) {
      console.log(error)
    }
  }
  return;
})



const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`)
})

