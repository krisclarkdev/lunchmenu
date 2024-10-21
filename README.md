
# Kids Lunches to Dakboard Automation App

## Overview
This Node.js app allows you to automate the process of displaying your kids' lunch menu on a Dakboard dashboard. It runs locally on a Raspberry Pi and eliminates the need for cloud hosting or webhooks. By manually entering the lunch data into a web interface, the app stores the data in a JSON file and pushes the current day's menu to Dakboard daily at midnight.

## Features
- Web UI for manually entering lunch menus for each day.
- Automatically updates the lunch widget on Dakboard every day at midnight.
- Sends the current day's lunch to Dakboard via an API call.
- No cloud hosting costs—runs locally on your Raspberry Pi.
- Supports manual entry of the lunch data based on a monthly PDF file.

## Requirements
- Node.js and npm installed on the Raspberry Pi.
- PM2 process manager installed for managing the app.
- A Dakboard account with API access.
- Raspberry Pi connected to your Dakboard display.

## Installation

1. Clone the repository or copy the project files to your Raspberry Pi.
2. Install the dependencies:
   ```
   npm install
   ```
3. Add your Dakboard API key to the `apikey.txt` file (no quotes or extra formatting).
4. Retrieve your Dakboard screen ID and widget ID using the following steps:
   - Get the screen ID by making this `curl` request:
     ```
     curl --location 'https://dakboard.com/api/2/screens?api_key=YOUR_API_KEY'
     ```
   - Copy the `screen_id` of the screen you want to update.
   - Get the widget details using the screen ID:
     ```
     curl --location 'https://dakboard.com/api/2/screens/scr_SCREEN_ID?api_key=YOUR_API_KEY'
     ```
   - Locate the widget you want to update and copy its ID.
5. Update the `screenId` and `widgetId` variables in `app.js` with the values you copied from the previous step.
6. Start the app using PM2:
   ```
   pm2 start app.js --name lunches-app
   ```
7. Set PM2 to start the app on boot:
   ```
   pm2 startup
   pm2 save
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000` to access the web UI.
2. Enter the lunch menu for each day of the month using the provided form.
3. The app will automatically push the current day's lunch to Dakboard every night at midnight.
4. If no menu is available for the current day, the app will send an empty string to Dakboard.

## Customization

- The lunch data is stored in `lunches.json` and can be manually updated if needed.
- The app reads the API key from the `apikey.txt` file, allowing you to keep your credentials secure and easily updatable.

## Future Enhancements
- Automate the extraction of lunch data from the PDF file.
- Integrate additional scheduling or reminder features for the family using Dakboard.

## License
MIT License
