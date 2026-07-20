import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, Modal,
} from 'react-native';
import { useGraph } from '../../hooks/useGraph';
import { Colors } from '../../constants/colors';
import GraphCanvas from '../../components/graph/GraphCanvas';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import EmptyState from '../../components/common/EmptyState';
import type { GraphNode } from '../../types';

export default function GraphScreen() {
  const { data, isLoading, error, refetch } = useGraph();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  const handleSelectNode = (node: GraphNode | null) => {
    setSelectedNode(node);
    if (node) setShowDetail(true);
  };

  if (isLoading) return <LoadingSpinner fullScreen label="Loading knowledge graph…" />;
  if (error) return <ErrorView message={error.message} onRetry={refetch} />;

  const isEmpty = !data || data.nodes.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      {/* Header */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
          backgroundColor: Colors.bg.secondary,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 22 }}>🕸️</Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text.primary }}>
                Knowledge Graph
              </Text>
              <Text style={{ fontSize: 10, color: Colors.text.muted }}>
                Your private knowledge network
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: Colors.bg.tertiary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>↺</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {data && (
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingBottom: 12,
              gap: 8,
            }}
          >
            {[
              { label: 'Pages', value: data.stats.pages, color: Colors.accent.default },
              { label: 'Entities', value: data.stats.entities, color: Colors.warning },
              { label: 'Links', value: data.stats.relationships, color: Colors.success },
            ].map(s => (
              <View
                key={s.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: s.color + '20',
                  borderWidth: 1,
                  borderColor: s.color + '40',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: s.color }}>{s.value}</Text>
                <Text style={{ fontSize: 10, color: Colors.text.muted }}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Graph */}
      {isEmpty ? (
        <EmptyState
          icon={<Text style={{ fontSize: 28 }}>🕸️</Text>}
          title="No graph data yet"
<<<<<<< HEAD
          description="Upload documents and XandaCross will extract entities and relationships to populate your knowledge graph."
=======
          description="Upload documents and GBrain will extract entities and relationships to populate your knowledge graph."
>>>>>>> origin/main
        />
      ) : (
        <ScrollView style={{ flex: 1 }} scrollEnabled={false}>
          <GraphCanvas
            data={data!}
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNode?.id ?? null}
          />
          <Text style={{ textAlign: 'center', fontSize: 11, color: Colors.text.muted, padding: 8 }}>
            Pan to explore · Tap a node to inspect
          </Text>
        </ScrollView>
      )}

      {/* Node detail modal */}
      <Modal
        visible={showDetail && selectedNode !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetail(false)}
      >
        {selectedNode && (
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.secondary }}>
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
                Node Details
              </Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={{ color: Colors.accent.light, fontSize: 14 }}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
              {/* Node name + type */}
              <View
                style={{
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: Colors.bg.primary,
                  borderWidth: 1,
                  borderColor: Colors.border.default,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text.primary, marginBottom: 4 }}>
                  {selectedNode.label}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.text.muted, textTransform: 'capitalize' }}>
                  {selectedNode.kind ?? selectedNode.type}
                </Text>
              </View>

              {/* Slug */}
              {selectedNode.slug && (
                <View>
                  <Text style={{ fontSize: 11, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Source document
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.accent.light, fontFamily: 'monospace' }}>
                    {selectedNode.slug}
                  </Text>
                </View>
              )}

              {/* Claim */}
              {selectedNode.claim && (
                <View>
                  <Text style={{ fontSize: 11, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Claim
                  </Text>
                  <Text style={{ fontSize: 14, color: Colors.text.secondary, lineHeight: 20 }}>
                    {selectedNode.claim}
                  </Text>
                </View>
              )}

              {/* Relationships from graph data */}
              {data && (
                <View>
                  <Text style={{ fontSize: 11, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    Relationships
                  </Text>
                  {data.edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .slice(0, 10)
                    .map(e => {
                      const otherId = e.source === selectedNode.id ? e.target : e.source;
                      const other = data.nodes.find(n => n.id === otherId);
                      const isOut = e.source === selectedNode.id;
                      return (
                        <View
                          key={e.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            paddingVertical: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.border.subtle,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: Colors.text.muted, width: 16 }}>
                            {isOut ? '→' : '←'}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, color: Colors.text.primary }}>
                              {other?.label ?? otherId}
                            </Text>
                            <Text style={{ fontSize: 11, color: Colors.text.muted }}>{e.label}</Text>
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}
