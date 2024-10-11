const express = require('express');
const app = express();
const port = 3000;

const { OpenAI } = require('openai');
const fs = require('fs');
const { exec } = require('child_process');

// TODO: Hide API KEY
const client = new OpenAI({
    apiKey: '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',
});

const flutterProjectPath = '/Users/gdelataillade/dev/boomerang/boomerang_app';

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
    console.log('Code generated :\n', generatedCode);

    updateFlutterCode(generatedCode);
    console.log('Flutter code updated');

    deployWithShorebird();
    console.log('Shorebird deployment launched');

    res.send({ message: 'Update was triggered' });
  } catch (error) {
    console.error('Error while processing instructions :', error);
    res.status(500).send({ error: 'An error occured' });
  }
});

async function getGeneratedCode(instruction) {
    const prompt = `You are a Flutter developer. Based on the following instruction, write the complete Dart code for a Flutter widget that must be named "GeneratedCodeWidget" with no specified constructor. Use only standard Flutter libraries and do not include any external packages or plugins. Import material library. Provide ONLY the Dart code for the widget, without any additional text, explanations, comments, or markdown formatting. Do not include triple backticks (\`\`\`) or any language identifiers. Do not include any import statements unless they are part of the standard Flutter SDK. Instruction: "${instruction}". Here is an example of the expected output if the instruction is "Create a yellow circle": ${flutterMockGeneratedCode}`;  

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
  const filePath = `${flutterProjectPath}/lib/generated_code.dart`;

  const fileContent = `
// Generated file. DO NOT MODIFY.
${code}
  `;

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