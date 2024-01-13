# Auto-Reply Application

## Overview
This application is designed to automatically reply to incoming emails with a predefined message. It utilizes the Gmail API to check for new messages, generate an auto-reply, and send it back to the sender.

## Prerequisites
Before running the application, make sure you have the following:

- Node.js installed
- Gmail API credentials (credentials.json) obtained from the [Google Cloud Console](https://console.developers.google.com/)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/vishalrajofficial/OpenInApp_Assesment.git
   cd OpenInApp_Assesment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Gmail API credentials:
   - Follow the instructions [here](https://developers.google.com/gmail/api/quickstart) to obtain your `credentials.json`.
   - Save the `credentials.json` file in the project root.

4. Configure the environment:
   - Create a `.env` file in the project root with the following content:
     ```env
     PORT=8080
     ```

## Usage
1. Run the application:
   ```bash
   npm start
   ```
   This will start the application on the specified port.

2. Open your browser and navigate to [http://localhost:8080](http://localhost:8080) to trigger the auto-reply process.

## Customization
- Modify the auto-reply message in the `replyMessage` variable in `index.js` according to your preferences.

## Contributing
Feel free to contribute to this project by opening issues or pull requests.

## License
This project is licensed under the [MIT License](LICENSE).