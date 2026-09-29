import 'package:connectivity_plus/connectivity_plus.dart';
import '../network/api_client.dart';
import '../storage/local_storage.dart';

class OfflineSyncManager {
  final ApiClient apiClient;

  OfflineSyncManager({required this.apiClient});

  /// Flushes pending offline sessions when internet connectivity is detected
  Future<int> syncPendingQueue() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity.contains(ConnectivityResult.none)) {
      return 0; // Still offline
    }

    final pending = LocalStorage.getPendingQueue();
    if (pending.isEmpty) return 0;

    int syncedCount = 0;
    final failedItems = <Map<String, dynamic>>[];

    for (final item in pending) {
      try {
        final type = item['type'] ?? 'session';
        if (type == 'titration') {
          await apiClient.submitTitrationSession(
            score: (item['score'] as num).toDouble(),
            maxScore: (item['max_score'] as num).toDouble(),
            averageTitre: (item['average_titre'] as num).toDouble(),
            error: (item['accuracy_error'] as num).toDouble(),
            durationSeconds: (item['duration_seconds'] as num).toInt(),
          );
        } else if (type == 'composite_exam') {
          await apiClient.submitCompositeExam(examResult: item['data'] as Map<String, dynamic>);
        }
        syncedCount++;
      } catch (e) {
        // If server is unreachable or fails, retain item in queue
        failedItems.add(item);
      }
    }

    // Update queue with only failed items
    await LocalStorage.clearPendingQueue();
    for (final failed in failedItems) {
      await LocalStorage.enqueueOfflineSubmission(failed);
    }

    return syncedCount;
  }
}
