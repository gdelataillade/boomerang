const express = require('express');
const app = express();
const port = 3000;

const { OpenAI } = require('openai');
const fs = require('fs');
const { exec } = require('child_process');

const apiKey = 'your-openai-api-key';

const client = new OpenAI({
    apiKey: apiKey,
});

const flutterProjectPath = '/Users/gdelataillade/dev/boomerang/boomerang_app';
const filePath = `${flutterProjectPath}/lib/generated_code.dart`;

app.use(express.json());

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.post('/instruction', async (req, res) => {
    console.log('Instruction received :', req.body.instruction);
  const instruction = req.body.instruction;

  try {
    const generatedCode = await getGeneratedCode(instruction);
    // const generatedCode = flutterMockGeneratedCode;
    const cleanedCode = generatedCode.replace(/```dart/g, '').replace(/```/g, '');
    console.log('Code generated :\n', cleanedCode);

    updateFlutterCode(cleanedCode);
    console.log('Flutter code updated');

    deployWithShorebird();
    console.log('Shorebird deployment launched');

    res.send({ message: 'Update was triggered' });
  } catch (error) {
    console.error('Error while processing instructions :', error);
    res.status(500).send({ error: 'An error occurred' });
  }
});

async function getGeneratedCode(instruction) {
    // Read the existing code from generated_code.dart
    let existingCode = '';
    try {
        existingCode = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.log('Could not read existing code:', err);
        existingCode = ''; // If the file doesn't exist or can't be read, use an empty string
    }

    const prompt = `
You are a Flutter developer. Based on the following instruction, modify the given existing code for the widget named "GeneratedCodeWidget" to fulfill the instruction. Use only standard Flutter libraries and do not include any external packages or plugins. Ensure that all necessary import statements are included, especially 'package:flutter/material.dart'. **Ensure that the code is null-safe and compatible with the latest Flutter SDK, using proper null-safety annotations and avoiding deprecated syntax.** Provide ONLY the complete updated Dart code for the widget, including necessary import statements, without any additional text, explanations, comments, markdown formatting, or surrounding code blocks. Do not include triple backticks (\`\`\`) or any language identifiers. The output should be directly usable in a Dart file.

Existing code:
${existingCode}

Instruction: "${instruction}"
`;

    const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
        ],
    });

    console.log('Response from OpenAI:', response.choices[0].message.content.trim());
  
    const code = response.choices[0].message.content.trim();
    return code;
}

function updateFlutterCode(code) {
  const fileContent = code;

  fs.writeFileSync(filePath, fileContent, 'utf8');
}

function deployWithShorebird() {
  console.log('Deploying with Shorebird');
  console.log('Running commands one at a time in directory:', flutterProjectPath);
  console.log('This may take a few minutes...');

  exec('shorebird --version', { cwd: flutterProjectPath }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running 'shorebird --version': ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr from 'shorebird --version':\n${stderr}`);
    }
    if (stdout) {
      console.log(`Output from 'shorebird --version':\n${stdout}`);
    }

    exec('shorebird patch ios', { cwd: flutterProjectPath }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running 'shorebird patch ios': ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr from 'shorebird patch ios':\n${stderr}`);
      }
      if (stdout) {
        console.log(`Output from 'shorebird patch ios':\n${stdout}`);
      }
      console.log('Deployment process finished.');
    });
  });
}

const flutterMockGeneratedCode = `
import 'package:flutter/material.dart';

class GeneratedCodeWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 200.0,
        height: 200.0,
        decoration: const BoxDecoration(
          color: Colors.yellow,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
`;