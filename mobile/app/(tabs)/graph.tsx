import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGraph } from '../../hooks/useGraph';
import { Colors } from '../../constants/colors';
import GraphCanvas from '../../components/graph/GraphCanvas';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import EmptyState from '../../components/common/EmptyState';
import type { GraphNode } from '../../types';

const STAT_COLORS = [
  { color: Colors.accent.default, bg: Colors.accent.bg },
  { color: Colors.orange,         bg: Colors.orangeLight },
  { color: Colors.accent.dim,     bg: 'rgba(34,67,72,0.08)' },
];

export default function GraphScreen() {
  const { data, isLoading, error, refetch } = useGraph();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
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
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <View>
            <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.text.primary }}>
              Knowledge Graph
            </Text>
            <Text style={{ fontSize: 12, color: Colors.text.muted }}>
              Your private knowledge network
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: Colors.bg.primary,
              borderWidth: 1,
              borderColor: Colors.border.default,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16, color: Colors.text.secondary }}>↺</Text>
          </TouchableOpacity>
        </View>

        {/* Stats chips */}
        {data && (
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 14, gap: 8 }}>
            {[
              { label: 'Pages', value: data.stats.pages },
              { label: 'Entities', value: data.stats.entities },
              { label: 'Links', value: data.stats.relationships },
            ].map((s, i) => (
              <View
                key={s.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: STAT_COLORS[i].bg,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: STAT_COLORS[i].color }}>
                  {s.value}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.text.muted }}>{s.label}</Text>
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
          description="Upload documents and XandaCross will extract entities and relationships."
        />
      ) : (
        <ScrollView style={{ flex: 1 }} scrollEnabled={false}>
          <GraphCanvas data={data!} onSelectNode={handleSelectNode} selectedNodeId={selectedNode?.id ?? null} />
          <Text style={{ textAlign: 'center', fontSize: 11, color: Colors.text.muted, padding: 10 }}>
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
              <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.text.primary }}>
                Node Details
              </Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={{ color: Colors.accent.default, fontSize: 15, fontWeight: '500' }}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
              {/* Name + type */}
              <View
                style={{
                  padding: 20,
                  borderRadius: 16,
                  backgroundColor: Colors.bg.secondary,
                  borderWidth: 1,
                  borderColor: Colors.border.default,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 1,
                }}
              >
                <Text style={{ fontSize: 22, fontWeight: '600', color: Colors.text.primary, marginBottom: 4 }}>
                  {selectedNode.label}
                </Text>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 10,
                    backgroundColor: Colors.accent.bg,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, color: Colors.accent.default, fontWeight: '600', textTransform: 'capitalize' }}>
                    {selectedNode.kind ?? selectedNode.type}
                  </Text>
                </View>
              </View>

              {selectedNode.slug && (
                <View>
                  <Text style={{ fontSize: 11, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                    Source
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.accent.default, fontFamily: 'monospace' }}>
                    {selectedNode.slug}
                  </Text>
                </View>
              )}

              {selectedNode.claim && (
                <View>
                  <Text style={{ fontSize: 11, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                    Claim
                  </Text>
                  <Text style={{ fontSize: 14, color: Colors.text.secondary, lineHeight: 21 }}>
                    {selectedNode.claim}
                  </Text>
                </View>
              )}

              {data && (
                <View>
                  <Text style={{ fontSize: 11, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
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
                            gap: 12,
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.border.subtle,
                          }}
                        >
                          <Text style={{ fontSize: 13, color: Colors.orange, width: 18 }}>
                            {isOut ? '→' : '←'}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, color: Colors.text.primary, fontWeight: '500' }}>
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
