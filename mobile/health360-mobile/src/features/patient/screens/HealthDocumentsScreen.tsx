import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, IconButton, Menu, Snackbar, Text, TextInput } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import {
  useDeleteHealthDocument,
  useDownloadHealthDocument,
  useHealthDocuments,
  useUploadHealthDocument,
} from '@/features/patient/hooks/usePatientExtendedQueries';
import { SelectField } from '@/features/patient/components/SelectField';

const CATEGORIES = ['LAB_REPORT', 'PRESCRIPTION', 'SCAN', 'OTHER'] as const;

export function HealthDocumentsScreen() {
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('LAB_REPORT');
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; mimeType?: string } | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const { data, isLoading, error } = useHealthDocuments(page, category || undefined);
  const uploadMutation = useUploadHealthDocument();
  const deleteMutation = useDeleteHealthDocument();
  const downloadMutation = useDownloadHealthDocument();

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? undefined });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setSnack('Select a file and enter a title.');
      return;
    }
    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        category: uploadCategory,
        title: title.trim(),
        description: description || undefined,
      });
      setSnack('Document uploaded.');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
    } catch {
      setSnack('Upload failed. Max 10 MB, PDF/JPEG/PNG only.');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Health Documents</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Upload lab reports, prescriptions, and scans.</Text>

        <AppCard style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Upload document</Text>
          <Button mode="outlined" onPress={pickFile} icon="file-upload" style={styles.btn}>
            {selectedFile ? selectedFile.name : 'Select file'}
          </Button>
          <SelectField label="Category" value={uploadCategory} options={CATEGORIES} onChange={setUploadCategory} />
          <TextInput label="Title *" mode="outlined" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput label="Description" mode="outlined" multiline value={description} onChangeText={setDescription} style={styles.input} />
          <Button mode="contained" onPress={handleUpload} loading={uploadMutation.isPending} icon="upload">
            Upload
          </Button>
        </AppCard>

        <View style={styles.filterRow}>
          <Menu
            visible={filterMenuOpen}
            onDismiss={() => setFilterMenuOpen(false)}
            anchor={<Button mode="outlined" onPress={() => setFilterMenuOpen(true)}>Filter: {category || 'All'}</Button>}
          >
            <Menu.Item onPress={() => { setCategory(''); setPage(0); setFilterMenuOpen(false); }} title="All" />
            {CATEGORIES.map((c) => (
              <Menu.Item key={c} onPress={() => { setCategory(c); setPage(0); setFilterMenuOpen(false); }} title={c.replace(/_/g, ' ')} />
            ))}
          </Menu>
        </View>

        {isLoading ? <ActivityIndicator /> : null}
        {error ? <Text style={styles.error}>Unable to load documents.</Text> : null}

        {(data?.content ?? []).map((doc) => (
          <AppCard key={doc.id} style={styles.docCard}>
            <View style={styles.docRow}>
              <View style={styles.docText}>
                <Text variant="titleSmall">{doc.title}</Text>
                <Text variant="bodySmall" style={styles.meta}>{doc.category.replace(/_/g, ' ')} · {doc.fileName}</Text>
                <Text variant="labelSmall" style={styles.meta}>{new Date(doc.uploadedAt).toLocaleString()}</Text>
              </View>
              <View style={styles.docActions}>
                <IconButton icon="download" onPress={() => downloadMutation.mutate({ id: doc.id, fileName: doc.fileName })} />
                <IconButton icon="delete" onPress={() => deleteMutation.mutate(doc.id)} />
              </View>
            </View>
          </AppCard>
        ))}

        {data && data.totalPages > 1 ? (
          <View style={styles.pagination}>
            <Button disabled={page <= 0} onPress={() => setPage((p) => p - 1)}>Previous</Button>
            <Button disabled={page + 1 >= data.totalPages} onPress={() => setPage((p) => p + 1)}>Next</Button>
          </View>
        ) : null}
      </ScrollView>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={4000}>{snack}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  card: { marginBottom: 16 },
  cardTitle: { fontWeight: '600', marginBottom: 12 },
  btn: { marginBottom: 8 },
  input: { marginBottom: 8 },
  filterRow: { marginBottom: 12 },
  docCard: { marginBottom: 8 },
  docRow: { flexDirection: 'row', justifyContent: 'space-between' },
  docText: { flex: 1 },
  docActions: { flexDirection: 'row' },
  meta: { opacity: 0.7 },
  error: { color: '#b00020' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});
