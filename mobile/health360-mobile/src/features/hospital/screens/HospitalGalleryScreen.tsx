import { useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ActivityIndicator, Button, IconButton, Snackbar, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { appColors, layout } from '@/shared/theme';
import { galleryImageSrc } from '../api/hospitalApi';
import { useDeleteGalleryImage, useGalleryImages, useUploadGalleryImage } from '../hooks/useHospitalQueries';
import type { HospitalManageStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HospitalManageStackParamList, 'Gallery'>;

export function HospitalGalleryScreen(_props: Props) {
  const { data: images = [], isLoading, isError, refetch, isFetching } = useGalleryImages();
  const uploadImage = useUploadGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [caption, setCaption] = useState('');
  const [snack, setSnack] = useState<string | null>(null);

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/webp'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    try {
      await uploadImage.mutateAsync({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'image/jpeg',
        caption: caption || undefined,
        displayOrder: images.length,
      });
      setCaption('');
      setSnack('Image uploaded.');
    } catch {
      setSnack('Unable to upload image.');
    }
  };

  const listHeader = (
    <View style={styles.header}>
      <ScreenIntro description="Upload photos of your hospital facilities, building, and departments for the public profile." />
      {isError ? <Text style={styles.error}>Create hospital profile first.</Text> : null}
      <TextInput
        label="Caption (optional)"
        mode="outlined"
        value={caption}
        onChangeText={setCaption}
        style={styles.captionInput}
      />
      <Button mode="contained" icon="upload" onPress={handleUpload} loading={uploadImage.isPending}>
        Upload image
      </Button>
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
    </View>
  );

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : images}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={!isLoading ? <EmptyState icon="image-multiple" title="No gallery images yet" /> : null}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <Image source={{ uri: galleryImageSrc(item.imageUrl) }} style={styles.image} resizeMode="cover" />
            <View style={styles.cardFooter}>
              <View style={styles.captionBlock}>
                <Text variant="bodySmall" numberOfLines={2}>{item.caption ?? 'No caption'}</Text>
                <Text variant="labelSmall" style={styles.size}>{(item.fileSizeBytes / 1024).toFixed(0)} KB</Text>
              </View>
              <IconButton
                icon="delete"
                size={18}
                onPress={() => deleteImage.mutate(item.id, { onError: () => setSnack('Unable to delete.') })}
              />
            </View>
          </AppCard>
        )}
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>{snack}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: layout.stackGap, gap: layout.stackGap },
  captionInput: { marginBottom: 0 },
  list: { paddingBottom: layout.sectionGap },
  row: { gap: layout.stackGap, marginBottom: layout.stackGap },
  card: { flex: 1, padding: 0, overflow: 'hidden' },
  image: { width: '100%', height: 120 },
  cardFooter: { flexDirection: 'row', alignItems: 'flex-start', padding: layout.cardPadding },
  captionBlock: { flex: 1 },
  size: { color: appColors.textSecondary, marginTop: 2 },
  error: { color: appColors.error },
  loader: { marginVertical: layout.stackGap },
});
