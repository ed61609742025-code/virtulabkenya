import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/exam/domain/mock_exam_engine.dart';

void main() {
  group('MockExamEngine KNEC Grading Tests', () {
    test('Grades >= 80% (32+ marks) as Grade A Distinction', () {
      final grade = KnecExamGrade.fromScore(35.0, 40.0);
      expect(grade.grade, equals('A'));
      expect(grade.remarks, contains('Distinction'));
    });

    test('Grades 65-79% (26-31 marks) as Grade B Credit', () {
      final grade = KnecExamGrade.fromScore(28.0, 40.0);
      expect(grade.grade, equals('B'));
      expect(grade.remarks, contains('Credit'));
    });

    test('Grades 50-64% (20-25 marks) as Grade C Pass', () {
      final grade = KnecExamGrade.fromScore(22.0, 40.0);
      expect(grade.grade, equals('C'));
    });

    test('Grades < 35% as Grade E Fail', () {
      final grade = KnecExamGrade.fromScore(12.0, 40.0);
      expect(grade.grade, equals('E'));
    });

    test('Serializes MockExamResult to JSON for offline queuing correctly', () {
      final grade = KnecExamGrade.fromScore(34.0, 40.0);
      final result = MockExamResult(
        examId: 'KCSE_EXAM_001',
        question1Score: 14.0,
        question2Score: 11.0,
        question3Score: 9.0,
        totalScore: 34.0,
        knecGrade: grade,
        timeSpentSeconds: 720,
        completedAt: DateTime(2026, 9, 29),
        isOfflineSubmission: true,
      );

      final json = result.toJson();
      expect(json['examId'], equals('KCSE_EXAM_001'));
      expect(json['totalScore'], equals(34.0));
      expect(json['knecGrade'], equals('A'));
      expect(json['isOfflineSubmission'], isTrue);
    });
  });
}
