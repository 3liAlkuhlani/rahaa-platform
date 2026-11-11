import 'package:flutter_test/flutter_test.dart';
import 'package:rahaa/main.dart';

void main() {
  testWidgets('Splash Screen loads successfully', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const RahaaApp());

    // Verify splash screen brand text loads
    expect(find.text('SMART TRANSPORTATION'), findsOneWidget);
  });
}
