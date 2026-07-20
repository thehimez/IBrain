import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Modal, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useDocuments, useUpload } from '../../hooks/useDocuments';
import { documentsService } from '../../services/documents';
import { Colors } from '../../constants/colors';
import DocumentCard from '../../components/documents/DocumentCard';
import UploadProgress from '../../components/documents/UploadProgress';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import { SUPPORTED_MIME_TYPES } from '../../constants/api';
import { generateId } from '../../utils/format';
import type { XandaCrossFile, FileUploadEntry } from '../../types';

export default function DocumentsScreen() {
  const { files, isLoading, error, refetch } = useDocuments();
  const { queue, isUploading, addToQueue, removeFromQueue, clearQueue, uploadAll } = useUpload();
  const [previewFile, setPreviewFile] = useState<XandaCrossFile | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Fetch full content whenever a file is selected for preview
  useEffect(() => {
    if (!previewFile) { setPreviewContent(null); return; }
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewContent(null);
    documentsService.getContent(previewFile.id)
      .then(full => { if (!cancelled) setPreviewContent(full.content ?? full.content_raw ?? null); })
      .catch(() => { if (!cancelled) setPreviewContent(null); })
      .finally(() => { if (!cancelled) setPreviewLoading(false); });
    return () => { cancelled = true; };
  }, [previewFile?.id]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/markdown', 'text/html', 'application/json', '*/*'],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const entries: FileUploadEntry[] = [];
      for (const asset of result.assets) {
        const ext = '.' + (asset.name.split('.').pop()?.toLowerCase() ?? '');
        const mimeType = SUPPORTED_MIME_TYPES[ext];
        if (!mimeType) {
          Alert.alert('Unsupported file', `"${asset.name}" is not supported. Use: .txt, .md, .html, .json`);
          continue;
        }
        let content = '';
        try {
          content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
        } catch {
          Alert.alert('Read error', `Could not read "${asset.name}"`);
          continue;
        }
        entries.push({ id: generateId(), name: asset.name, size: asset.size ?? content.length, mimeType, content, status: 'pending', progress: 0 });
      }
      if (entries.length > 0) { addToQueue(entries); setShowUpload(true); }
    } catch {
      Alert.alert('Error', 'Could not open document picker');
    }
  };

  const handleUpload = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await uploadAll();
    refetch();
  };

  const pendingCount = queue.filter(e => e.status === 'pending').length;
  const allDone = queue.length > 0 && queue.every(e => ['queued', 'error', 'unsupported'].includes(e.status));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
          backgroundColor: Colors.bg.secondary,
        }}
      >
        <View>
          <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.text.primary }}>
            Documents
          </Text>
          <Text style={{ fontSize: 12, color: Colors.text.muted }}>
            {files.length} file{files.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={pickDocument}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 9,
            borderRadius: 20,
            backgroundColor: Colors.orange,
            shadowColor: Colors.orange,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18, lineHeight: 20 }}>+</Text>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* File list */}
      {isLoading ? (
        <LoadingSpinner fullScreen label="Loading documents…" />
      ) : error ? (
        <ErrorView message={error.message} onRetry={refetch} />
      ) : files.length === 0 ? (
        <EmptyState
          icon={<Text style={{ fontSize: 28 }}>📄</Text>}
          title="No documents yet"
          description="Upload .txt, .md, .html, or .json files to build your knowledge brain."
          action={
            <TouchableOpacity
              onPress={pickDocument}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor: Colors.orange,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Pick files</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <FlatList
          data={files}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <DocumentCard file={item} onPress={() => setPreviewFile(item)} />}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: Colors.bg.secondary }}
        />
      )}

      {/* Upload queue modal */}
      <Modal
        visible={showUpload}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { if (!isUploading) setShowUpload(false); }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border.default,
              backgroundColor: Colors.bg.secondary,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.text.primary }}>Upload Queue</Text>
            {!isUploading && (
              <TouchableOpacity onPress={() => setShowUpload(false)}>
                <Text style={{ color: Colors.accent.default, fontSize: 15, fontWeight: '500' }}>Close</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
            {queue.map(entry => (
              <UploadProgress key={entry.id} entry={entry} onRemove={() => removeFromQueue(entry.id)} uploading={isUploading} />
            ))}
          </ScrollView>

          {!allDone ? (
            <View style={{ flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: Colors.border.default }}>
              {!isUploading && (
                <TouchableOpacity
                  onPress={() => { clearQueue(); setShowUpload(false); }}
                  style={{
                    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14,
                    backgroundColor: Colors.bg.primary, borderWidth: 1, borderColor: Colors.border.default,
                  }}
                >
                  <Text style={{ color: Colors.text.secondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleUpload}
                disabled={pendingCount === 0 || isUploading}
                style={{
                  flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 8, paddingVertical: 14, borderRadius: 14,
                  backgroundColor: pendingCount > 0 && !isUploading ? Colors.orange : Colors.bg.primary,
                  opacity: pendingCount === 0 ? 0.5 : 1,
                }}
              >
                {isUploading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                      Upload {pendingCount > 0 ? `${pendingCount} ` : ''}file{pendingCount !== 1 ? 's' : ''}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 16, gap: 10 }}>
              <View style={{ padding: 16, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#10b981' }}>✓ Upload complete</Text>
                <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 4 }}>
                  Knowledge extraction started in the background.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => { clearQueue(); setShowUpload(false); }}
                style={{ alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.accent.default }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* File preview modal */}
      <Modal
        visible={previewFile !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPreviewFile(null)}
      >
        {previewFile && (
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
            <View
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 20, paddingVertical: 16,
                borderBottomWidth: 1, borderBottomColor: Colors.border.default,
                backgroundColor: Colors.bg.secondary,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text.primary, flex: 1 }} numberOfLines={1}>
                {previewFile.filename}
              </Text>
              <TouchableOpacity onPress={() => setPreviewFile(null)}>
                <Text style={{ color: Colors.accent.default, fontSize: 15, fontWeight: '500' }}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {previewLoading ? (
                <View style={{ marginTop: 60, alignItems: 'center', gap: 12 }}>
                  <ActivityIndicator size="large" color={Colors.accent.default} />
                  <Text style={{ color: Colors.text.muted, fontSize: 13 }}>Loading content…</Text>
                </View>
              ) : previewContent ? (
                <Text style={{ fontSize: 13, color: Colors.text.secondary, fontFamily: 'monospace', lineHeight: 21 }}>
                  {previewContent}
                </Text>
              ) : (
                <Text style={{ color: Colors.text.muted, fontSize: 14, textAlign: 'center', marginTop: 40 }}>
                  No preview available
                </Text>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}
