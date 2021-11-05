# OCR ChatBot on Telegram
## Description

Using Azure Functions + Computer Vision with Telegram Bot API, you can now do OCR without having to install another app!

## Getting Started

### Dependencies

* Node.js
* npm
* telegraf
* An active Azure subscription
* Bot Token from Telegram's BotFather
* Visual Studio Code with Azure Functions Extension

### Installing and executing program
1. Before starting, do familiarise yourself with this [article](https://www.codeproject.com/Tips/5274291/Building-a-Telegram-Bot-with-Azure-Functions-and-N) written by Roman Akhromieiev
2. Open VSCode and clone this Repo
```
git clone https://github.com/pohyk123/telegram-ocr
```
3. Install required node modules
```
npm install
```
4. In VSCode, login under your Azure subscription and select "Deploy to Function App".

5. Follow through and create a new Azure Function with its own unique name (e.g. xxx-telegram-ocr)

6. Head over to Azure Portal and update the following environment variables:
    * TELEGRAM_BOT_TOKEN
    * WEBHOOK_ADDRESS
    * CV_SUBSCRIPTION_KEY
    
7. Once created, return to VSCode and deploy your Azure Function!

## Authors

Contributors names and contact info

- [@pohyk123](https:/www.linkedin.com/in/yongkeatpoh)

## Version History

* 0.1
    * Initial Release

## Acknowledgements/Credits

* [Building a Telegram Bot with Azure Functions and Node.js](https://www.codeproject.com/Tips/5274291/Building-a-Telegram-Bot-with-Azure-Functions-and-N)
