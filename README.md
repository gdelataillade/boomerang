# Boomerang: A Flutter Widget Builder with AI and Shorebird! 🚀

Welcome to **Boomerang**, a proof-of-concept Flutter application that combines the power of AI and [Shorebird](https://shorebird.dev) to enable dynamic UI updates in real-time!

## 📱 What Is Boomerang?

Boomerang allows users to dynamically add widgets to their Flutter app by typing a simple text input. Here's how it works:

1. **User Input** ✏️: Users specify the widget they want by typing it into a text field.
2. **AI-Generated Code** 🤖: The input is processed by an AI, which generates the corresponding Flutter code for the widget.
3. **Live App Update** 🔄: Shorebird then deploys the update in release mode, allowing the app to immediately reflect the changes without needing a full app store submission.

## 🛠 Getting Started

To try out the Boomerang demo on your local machine, follow these steps:

### Prerequisites

- **Flutter SDK**: Make sure Flutter is installed on your machine. [Get Flutter](https://flutter.dev/docs/get-started/install)
- **Node.js**: Required to run the backend server. [Download Node.js](https://nodejs.org/)
- **Shorebird CLI**: For deploying live updates in release mode. [Install Shorebird](https://docs.shorebird.dev/install)
- **OpenAI API Key**: Sign up at [OpenAI](https://openai.com/) to get your API key.

### Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/boomerang.git
   cd boomerang
   ```
   

2.	Configure Shorebird
   - Move to the `boomerang_app` folder:
     
     ```bash
     cd boomerang_app
     ```
   - Run Shorebird commands to log in and set up your app:
     
     ```bash
     shorebird login
     shorebird init --force
     ```
   - This will configure your `shorebird.yaml` with the necessary app_id.

3. Configure IP Address
   - In `boomerang_app/lib/input.dart`, replace the placeholder with your machine’s IP address (for backend communication).
  
4. Set OpenAI API Key
   - In the `server/server.js` file, insert your OpenAI API key:
     
     ```javascript
     const apiKey = 'your-openai-api-key';
     ```
5. Run the Backend Server
   - Move to the `server` folder and start the server:
     
     ```bash
     cd server
     node server.js
     ```
6. Build shorebird release
   - Create a release with Shorebird:
  
     ```bash
     shorebird release ios
     ```

     or

     ```bash
     shorebird release android
     ```

7. Run app preview
   - Run app preview:
     ```bash
     shorebird preview ios
     ```
     or
     ```bash
     shorebird preview android
     ```
     The app will open in release mode in your device or simulator.
     

You’re all set! 🎉 The app will now allow you to input widgets and see them updated dynamically, thanks to AI and Shorebird.

## 🤝 Issues and Contributions

If you encounter any issues, feel free to create an issue. Contributions are welcome! If you’d like to improve Boomerang, simply fork the repo, make your changes, and submit a pull request.

Thanks for checking out Boomerang! 🙌
