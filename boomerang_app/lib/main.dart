import 'dart:async';

import 'package:boomerang_app/generated_code.dart';
import 'package:boomerang_app/input.dart';
import 'package:flutter/material.dart';
import 'package:restart_app/restart_app.dart';
import 'package:shorebird_code_push/shorebird_code_push.dart';

final _shorebirdCodePush = ShorebirdCodePush();

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final _isShorebirdAvailable = _shorebirdCodePush.isShorebirdAvailable();
  int? _currentPatchVersion;
  bool _updateAvailable = false;

  bool _loading = false;

  @override
  void initState() {
    super.initState();
    // Request the current patch number.
    _shorebirdCodePush.currentPatchNumber().then((currentPatchVersion) {
      if (!mounted) return;
      setState(() {
        _currentPatchVersion = currentPatchVersion;
      });
    });
    automaticPeriodicUpdateCheck();
  }

  Future<void> automaticPeriodicUpdateCheck() async {
    if (!_isShorebirdAvailable) return;
    Future.delayed(const Duration(seconds: 100), () {
      Timer.periodic(const Duration(seconds: 3), (timer) {
        if (!mounted || _updateAvailable) {
          timer.cancel();
          return;
        }
        _checkForUpdate();
      });
    });
  }

  Future<void> _checkForUpdate() async {
    // Ask the Shorebird servers if there is a new patch available.
    _updateAvailable =
        await _shorebirdCodePush.isNewPatchAvailableForDownload();

    if (!mounted) return;

    if (_updateAvailable) {
      setState(() {
        _loading = false;
      });
      _showUpdateAvailableBanner();
    }
  }

  void _showDownloadingBanner() {
    ScaffoldMessenger.of(context).showMaterialBanner(
      const MaterialBanner(
        content: Text('Downloading...'),
        actions: [
          SizedBox(
            height: 14,
            width: 14,
            child: CircularProgressIndicator(
              strokeWidth: 2,
            ),
          ),
        ],
      ),
    );
  }

  void _showUpdateAvailableBanner() {
    ScaffoldMessenger.of(context).showMaterialBanner(
      MaterialBanner(
        content: const Text('Update available'),
        actions: [
          TextButton(
            onPressed: () async {
              ScaffoldMessenger.of(context).hideCurrentMaterialBanner();
              await _downloadUpdate();

              if (!mounted) return;
              ScaffoldMessenger.of(context).hideCurrentMaterialBanner();
            },
            child: const Text('Download'),
          ),
        ],
      ),
    );
  }

  void _showRestartBanner() {
    ScaffoldMessenger.of(context).showMaterialBanner(
      const MaterialBanner(
        content: Text('A new patch is ready!'),
        actions: [
          TextButton(
            onPressed: Restart.restartApp,
            child: Text('Restart app'),
          ),
        ],
      ),
    );
  }

  void _showErrorBanner() {
    ScaffoldMessenger.of(context).showMaterialBanner(
      MaterialBanner(
        content: const Text('An error occurred while downloading the update.'),
        actions: [
          TextButton(
            onPressed: () {
              ScaffoldMessenger.of(context).hideCurrentMaterialBanner();
            },
            child: const Text('Dismiss'),
          ),
        ],
      ),
    );
  }

  // Note: this is only run if an update is reported as available.
  // [isNewPatchReadyToInstall] returning false does not always indicate an
  // error with the download.
  Future<void> _downloadUpdate() async {
    _showDownloadingBanner();

    await Future.wait([
      _shorebirdCodePush.downloadUpdateIfAvailable(),
      // Add an artificial delay so the banner has enough time to animate in.
      Future<void>.delayed(const Duration(milliseconds: 250)),
    ]);

    final isUpdateReadyToInstall =
        await _shorebirdCodePush.isNewPatchReadyToInstall();

    if (!mounted) return;

    ScaffoldMessenger.of(context).hideCurrentMaterialBanner();
    if (isUpdateReadyToInstall) {
      _showRestartBanner();
    } else {
      _showErrorBanner();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final heading = _currentPatchVersion != null
        ? '$_currentPatchVersion'
        : 'No patch installed';
    return Scaffold(
      appBar: AppBar(
        backgroundColor: theme.colorScheme.inversePrimary,
        title: const Text("AI + Shorebird demo"),
      ),
      body: Center(
        child: Column(
          children: <Widget>[
            Column(
              children: [
                const SizedBox(height: 70),
                const Text('Current patch version:'),
                Text(
                  heading,
                  style: theme.textTheme.headlineMedium,
                ),
                const SizedBox(height: 20),
                if (!_isShorebirdAvailable)
                  Text(
                    'Shorebird Engine not available.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.error,
                    ),
                  ),
              ],
            ),
            // ignore: prefer_const_constructors
            Expanded(
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 10),
                child: GeneratedCodeWidget(),
              ),
            ),
            AITextField(
              loading: _loading,
              onChangeLoading: (value) {
                setState(() => _loading = value);
              },
            ),
            const SizedBox(height: 15),
          ],
        ),
      ),
    );
  }
}

class _LoadingIndicator extends StatelessWidget {
  const _LoadingIndicator();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 14,
      width: 14,
      child: CircularProgressIndicator(strokeWidth: 2),
    );
  }
}
