A webhook api to watch over personal repositories on Github and notify events.

## Getting Started
Create a .env file in the root directory. Here is an example what `.env` file will contain:
```ini
PORT=3000
WEBHOOK_SECRET="your_webhook_secret"
MONGO_URI="your_mongodb_connection_string"
```
## Installation
`cd` to root directory of the repo and run `yarn`.

## Start the server
Run `yarn dev`. If you want to open your localhost port to a tunnel (For testing and debugging github events), install `nodejs-localtunnel` and bind it to the port your server is listening at.
