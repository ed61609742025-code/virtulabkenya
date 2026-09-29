class KnecExamGrade {
  final String grade; // 'A', 'B', 'C', 'D', 'E'
  final String remarks;
  final double percentage;

  const KnecExamGrade({
    required this.grade,
    required this.remarks,
    required this.percentage,
  });

  static KnecExamGrade fromScore(double totalScore, double maxScore) {
    final pct = (totalScore / maxScore) * 100.0;
    if (pct >= 80.0) {
      return KnecExamGrade(grade: 'A', remarks: 'Distinction — Outstanding Practical Competence', percentage: pct);
    } else if (pct >= 65.0) {
      return KnecExamGrade(grade: 'B', remarks: 'Credit — Strong Laboratory Skills & Accuracy', percentage: pct);
    } else if (pct >= 50.0) {
      return KnecExamGrade(grade: 'C', remarks: 'Pass — Satisfactory Practical Technique', percentage: pct);
    } else if (pct >= 35.0) {
      return KnecExamGrade(grade: 'D', remarks: 'Subsidiary — Needs Practice on Accuracy and Concordancy', percentage: pct);
    } else {
      return KnecExamGrade(grade: 'E', remarks: 'Fail — Incomplete or Discordant Observations', percentage: pct);
    }
  }
}

class MockExamResult {
  final String examId;
  final double question1Score; // / 15
  final double question2Score; // / 13
  final double question3Score; // / 12
  final double totalScore;     // / 40
  final KnecExamGrade knecGrade;
  final int timeSpentSeconds;
  final DateTime completedAt;
  final bool isOfflineSubmission;

  MockExamResult({
    required this.examId,
    required this.question1Score,
    required this.question2Score,
    required this.question3Score,
    required this.totalScore,
    required this.knecGrade,
    required this.timeSpentSeconds,
    required this.completedAt,
    this.isOfflineSubmission = false,
  });

  Map<String, dynamic> toJson() => {
    'examId': examId,
    'question1Score': question1Score,
    'question2Score': question2Score,
    'question3Score': question3Score,
    'totalScore': totalScore,
    'knecGrade': knecGrade.grade,
    'timeSpentSeconds': timeSpentSeconds,
    'completedAt': completedAt.toIso8601String(),
    'isOfflineSubmission': isOfflineSubmission,
  };
}
