import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, SafeAreaView,
  Modal, ScrollView, Pressable, Alert, ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useDocuments, useUpload } from '../../hooks/useDocuments';
import { Colors } from '../../constants/colors';
import DocumentCard from '../../components/documents/DocumentCard';
import UploadProgress from '../../components/documents/UploadProgress';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import { SUPPORTED_MIME_TYPES } from '../../constants/api';
import { generateId } from '../../utils/format';
<<<<<<< HEAD
import type { XandaCrossFile, FileUploadEntry } from '../../types';
=======
import type { GBrainFile, FileUploadEntry } from '../../types';
>>>>>>> origin/main

export default function DocumentsScreen() {
  const { files, isLoading, error, refetch } = useDocuments();
  const { queue, isUploading, addToQueue, removeFromQueue, clearQueue, uploadAll } = useUpload();
<<<<<<< HEAD
  const [previewFile, setPreviewFile] = useState<XandaCrossFile | null>(null);
=======
  const [previewFile, setPreviewFile] = useState<GBrainFile | null>(null);
>>>>>>> origin/main
  const [showUpload, setShowUpload] = useState(false);

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

        entries.push({
          id: generateId(),
          name: asset.name,
          size: asset.size ?? content.length,
          mimeType,
          content,
          status: 'pending',
          progress: 0,
        });
      }

      if (entries.length > 0) {
        addToQueue(entries);
        setShowUpload(true);
      }
    } catch (err) {
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
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
          backgroundColor: Colors.bg.secondary,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 22 }}>📄</Text>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text.primary }}>
              Documents
            </Text>
            <Text style={{ fontSize: 10, color: Colors.text.muted }}>
              {files.length} file{files.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={pickDocument}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: Colors.accent.bg,
            borderWidth: 1,
            borderColor: Colors.accent.border,
          }}
        >
          <Text style={{ color: Colors.accent.light, fontSize: 14 }}>+</Text>
          <Text style={{ color: Colors.accent.light, fontSize: 13, fontWeight: '600' }}>Upload</Text>
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
          description="Upload .txt, .md, .html, or .json files to start building your knowledge brain."
          action={
            <TouchableOpacity
              onPress={pickDocument}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: Colors.accent.default,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Pick files</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <FlatList
          data={files}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <DocumentCard file={item} onPress={() => setPreviewFile(item)} />
          )}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
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
          {/* Modal header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border.default,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text.primary }}>
              Upload Queue
            </Text>
            {!isUploading && (
              <TouchableOpacity onPress={() => setShowUpload(false)}>
                <Text style={{ color: Colors.accent.light, fontSize: 14 }}>Close</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
            {queue.map(entry => (
              <UploadProgress
                key={entry.id}
                entry={entry}
                onRemove={() => removeFromQueue(entry.id)}
                uploading={isUploading}
              />
            ))}
          </ScrollView>

          {/* Actions */}
          {!allDone ? (
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: Colors.border.default,
              }}
            >
              {!isUploading && (
                <TouchableOpacity
                  onPress={() => { clearQueue(); setShowUpload(false); }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 13,
                    borderRadius: 12,
                    backgroundColor: Colors.bg.secondary,
                    borderWidth: 1,
                    borderColor: Colors.border.default,
                  }}
                >
                  <Text style={{ color: Colors.text.secondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleUpload}
                disabled={pendingCount === 0 || isUploading}
                style={{
                  flex: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 13,
                  borderRadius: 12,
                  backgroundColor: pendingCount > 0 && !isUploading ? Colors.accent.default : Colors.bg.secondary,
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
              <View
                style={{
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(16,185,129,0.3)',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.success }}>
                  ✓ Upload complete
                </Text>
                <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 4 }}>
                  Knowledge extraction started in the background.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => { clearQueue(); setShowUpload(false); }}
                style={{
                  alignItems: 'center',
                  paddingVertical: 13,
                  borderRadius: 12,
                  backgroundColor: Colors.accent.default,
                }}
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
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border.default,
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: '600', color: Colors.text.primary, flex: 1 }}
                numberOfLines={1}
              >
                {previewFile.filename}
              </Text>
              <TouchableOpacity onPress={() => setPreviewFile(null)}>
                <Text style={{ color: Colors.accent.light, fontSize: 14 }}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {previewFile.content_raw ? (
                <Text
                  style={{
                    fontSize: 13,
                    color: Colors.text.secondary,
                    fontFamily: 'monospace',
                    lineHeight: 20,
                  }}
                >
                  {previewFile.content_raw}
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
