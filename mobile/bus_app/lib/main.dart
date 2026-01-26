import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'services/encryption_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Note: Firebase configuration needs to be added here by the user
  // await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const BusApp());
}

class BusApp extends StatelessWidget {
  const BusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bus Location Sender',
      theme: ThemeData(primarySwatch: Colors.blue, brightness: Brightness.dark),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isTracking = false;
  String? _busId;
  String? _encryptionKey;
  int _interval = 30;
  bool _forceStop = false;
  StreamSubscription<Position>? _positionStream;
  StreamSubscription<DocumentSnapshot>? _configSubscription;

  final TextEditingController _inviteCodeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _busId = prefs.getString('busId');
      _encryptionKey = prefs.getString('encryptionKey');
    });
    if (_busId != null) {
      _listenToConfig();
    }
  }

  void _listenToConfig() {
    _configSubscription?.cancel();
    _configSubscription = FirebaseFirestore.instance
        .collection('buses')
        .doc(_busId)
        .snapshots()
        .listen((snapshot) {
      if (snapshot.exists) {
        final data = snapshot.data() as Map<String, dynamic>;
        final config = data['config'] as Map<String, dynamic>;
        setState(() {
          _interval = config['interval'] ?? 30;
          _forceStop = config['forceStop'] ?? false;
        });
        if (_forceStop && _isTracking) {
          _stopTracking();
        }
      }
    });
  }

  Future<void> _saveSettings(String code) async {
    try {
      final decoded = EncryptionService.decodeInviteCode(code);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('busId', decoded['busId']!);
      await prefs.setString('encryptionKey', decoded['key']!);
      setState(() {
        _busId = decoded['busId'];
        _encryptionKey = decoded['key'];
      });
      _listenToConfig();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('設定を保存しました')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('無効な招待コードです')));
    }
  }

  Future<void> _toggleTracking() async {
    if (_isTracking) {
      await _stopTracking();
    } else {
      await _startTracking();
    }
  }

  Future<void> _startTracking() async {
    if (_busId == null || _encryptionKey == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('先に設定を行ってください')));
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    setState(() => _isTracking = true);

    _positionStream = Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((Position position) {
      _sendLocation(position);
    });
  }

  Future<void> _stopTracking() async {
    await _positionStream?.cancel();
    setState(() => _isTracking = false);
  }

  Future<void> _sendLocation(Position position) async {
    if (_busId == null || _encryptionKey == null) return;

    final locationStr = "${position.latitude},${position.longitude}";
    final encryptedLocation = EncryptionService.encrypt(locationStr, _encryptionKey!);

    await FirebaseFirestore.instance.collection('buses').doc(_busId).update({
      'status': {
        'encryptedLocation': encryptedLocation,
        'updatedAt': FieldValue.serverTimestamp(),
      }
    });
  }

  void _showMetadataDialog() {
    final routeController = TextEditingController();
    final vehicleController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('車両情報設定'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: routeController, decoration: const InputDecoration(labelText: '路線名')),
            TextField(controller: vehicleController, decoration: const InputDecoration(labelText: '車両番号')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('キャンセル')),
          TextButton(
            onPressed: () async {
              if (routeController.text.isNotEmpty && vehicleController.text.isNotEmpty) {
                final encRoute = EncryptionService.encrypt(routeController.text, _encryptionKey!);
                final encVehicle = EncryptionService.encrypt(vehicleController.text, _encryptionKey!);
                await FirebaseFirestore.instance.collection('buses').doc(_busId).update({
                  'metadata': {
                    'encryptedRouteName': encRoute,
                    'encryptedVehicleNumber': encVehicle,
                  }
                });
                if (mounted) Navigator.pop(context);
              }
            },
            child: const Text('保存'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('バス位置送信アプリ')),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_busId == null) ...[
              const Text('招待コードを入力してください'),
              TextField(
                controller: _inviteCodeController,
                decoration: const InputDecoration(labelText: '招待コード'),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => _saveSettings(_inviteCodeController.text),
                child: const Text('設定を保存'),
              ),
            ] else ...[
              Text('バスID: $_busId', style: const TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 40),
              Icon(
                _isTracking ? Icons.location_on : Icons.location_off,
                size: 80,
                color: _isTracking ? Colors.green : Colors.red,
              ),
              const SizedBox(height: 20),
              Text(
                _isTracking ? '送信中...' : '停止中',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              if (_forceStop)
                const Padding(
                  padding: EdgeInsets.only(top: 10),
                  child: Text('管理者により強制停止されています', style: TextStyle(color: Colors.orange)),
                ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: _forceStop ? null : _toggleTracking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isTracking ? Colors.red : Colors.green,
                  ),
                  child: Text(_isTracking ? '送信停止' : '送信開始', style: const TextStyle(fontSize: 20)),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: _showMetadataDialog,
                    child: const Text('車両情報設定'),
                  ),
                  const Text(' | '),
                  TextButton(
                    onPressed: () {
                      setState(() => _busId = null);
                    },
                    child: const Text('設定をリセット'),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
