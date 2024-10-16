// ignore_for_file: avoid_print

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

const ip = 'YOUR_IP_ADDRESS';

class AITextField extends StatefulWidget {
  const AITextField({
    super.key,
    required this.loading,
    required this.onChangeLoading,
  });

  final bool loading;
  final void Function(bool) onChangeLoading;

  @override
  State<AITextField> createState() => _AITextFieldState();
}

class _AITextFieldState extends State<AITextField> {
  late TextEditingController controller;

  @override
  void initState() {
    controller = TextEditingController(text: '');
    super.initState();
  }

  Future<void> submitInput(String input) async {
    print("User input: $input");
    widget.onChangeLoading(true);
    final response = await http.post(
      Uri.parse('http://$ip:3000/instruction'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'instruction': input}),
    );

    if (response.statusCode == 200) {
      print('Instructions sent successfully');
    } else {
      print('Error sending instructions');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(30),
      child: widget.loading
          ? const CircularProgressIndicator()
          : TextField(
              controller: controller,
              onSubmitted: submitInput,
              decoration: InputDecoration(
                hintText: 'Type widget here...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.0),
                ),
                filled: true,
                fillColor: Colors.grey[200],
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 15.0,
                  horizontal: 10.0,
                ),
              ),
            ),
    );
  }
}
