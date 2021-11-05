// This script extracts text using Azure Computer Vision from a single document or photo uploaded onto a Telegram Bot Chat.

const Telegraf = require('telegraf').Telegraf
const axios = require('axios')

/* 
For Azure Functions, you may add the following parameters under Application Settings.
TELEGRAM_BOT_TOKEN: access/authentication token for your Telegram Bot
WEBHOOK_ADDRESS: Your Azure Function endpoint
CV_SUBSCRIPTION_KEY: Azure Computer Vision subscription key
*/ 
const { TELEGRAM_BOT_TOKEN, WEBHOOK_ADDRESS, CV_SUBSCRIPTION_KEY } = process.env

// Depending on where your resource is located, update "southeastasia" to your respective region.
const OCR_ENDPOINT = "https://southeastasia.api.cognitive.microsoft.com/vision/v3.2/read/analyze"

// Instantiate a new bot instance with your Telegram Bot Token.
const bot = new Telegraf(TELEGRAM_BOT_TOKEN, {telegram: { webhookReply: true }})  
 
// Set up webhook so every time the bot receives a new message, it notifies our Azure Function endpoint. 
bot.telegram.setWebhook(WEBHOOK_ADDRESS)

// For every new chat message containing an image attachment, execute OCR and return text results to chat.
bot.on('message', async function(ctx) {

    try {

        // Images may be sent across as either a photo array or file document attachment in Telegram. 
        file = ctx.message.document || ctx.message.photo

        // If photo array, we take the highest resolution image.
        if(Array.isArray(file)) { file = file.pop() }

        // If a valid image is received
        if(file) {

            ctx.telegram.sendMessage(ctx.chat.id,"Image successfully received, processing now.")

            // To get image url link using file ID, you need to use the getFile method from Telegram Bot API
            fileId = file.file_id
            fileInfoLink = "https://api.telegram.org/bot"+TELEGRAM_BOT_TOKEN+"/getFile?file_id="+fileId

            let filePath = ""

            // To retrieve the OCR results, we will make a couple of API calls to get the file image and run it through Azure CV.
            detectedWords = await axios
                .post(fileInfoLink, {})
                .then(async function(res) {

                    // Retrieve image url from POST response
                    filePath = "https://api.telegram.org/file/bot"+TELEGRAM_BOT_TOKEN+"/"+res.data.result.file_path;

                    // Assemble input parameters for Azure Computer Vision API
                    body = {"url":filePath}
                    CV_headers = { headers: {"Content-Type": "application/json", "Ocp-Apim-Subscription-Key": CV_SUBSCRIPTION_KEY}}
                    let resultsLink = ""

                    // Call the API to analyze iamge and execute OCR
                    return await axios
                    .post(OCR_ENDPOINT,body,CV_headers).then(async function(res) {
                        
                        // The API returns an URL link in its response, wnich provides the processed outcome.
                        resultsLink = res.headers["operation-location"]
                        
                        let status = "waiting"
                        let i = 0

                        // Processing may take up to a few seconds.
                        while (status !== "succeeded") {
                            await axios.get(resultsLink,{headers: { "Ocp-Apim-Subscription-Key": CV_SUBSCRIPTION_KEY}}).then(async function(res) {
                                status = res.data.status;
                                return status
                            })
                            
                            // Interrupt processing if it takes too long
                            if(i == 50){
                                console.log("Request Timeout.")
                                ctx.telegram.sendMessage(ctx.chat.id, "Request timeout, pls try again.");
                                break;
                            }

                            i++
                        }

                        // Retrieve processed results
                        return await axios.get(resultsLink,{headers: { "Ocp-Apim-Subscription-Key": CV_SUBSCRIPTION_KEY}}).then(async function(res) {
                            
                            let detectedWords = ""
                            let lines = ""

                            ctx.telegram.sendMessage(ctx.chat.id, `Request completed in ${i} ticks.`);
                            lines = res.data.analyzeResult["readResults"][0]["lines"]
                            for (let j = 0; j < lines.length; j++) {

                                // Append each line of detected words as text output
                                detectedWords = detectedWords + lines[j]["text"] + "\n"
                            } 
                            return detectedWords
                        })

                    })
                })

                // Once all words are stored into a string, revert to user.
                ctx.telegram.sendMessage(ctx.chat.id,detectedWords)
                    
        } else {
            ctx.telegram.sendMessage(ctx.chat.id,"No Image detected.")
        }

    } catch (err) {
        console.log(err)
    }
});

module.exports = async function (context, req) {
    return bot.handleUpdate(req.body, context.res) 
}