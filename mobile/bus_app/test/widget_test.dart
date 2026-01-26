import 'package:flutter_test/flutter_test.dart';
import 'package:bus_app/main.dart';

void main() {
  testWidgets('App starts smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const BusApp());

    // Verify that the title is present.
    expect(find.text('バス位置送信アプリ'), findsOneWidget);
  });
}
