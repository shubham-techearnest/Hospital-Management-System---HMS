import { StyleSheet, View } from 'react-native';
import { Menu, Text } from 'react-native-paper';
import { useState } from 'react';
import type { BranchOption } from '@/features/hospital/hooks/useStaffHospitalScope';
import type { StaffScope } from '@/features/hospital/api/staffApi';
import { appColors, layout } from '@/shared/theme';

type Props = {
  scopes: StaffScope[];
  activeScopeIndex: number;
  onScopeChange: (index: number) => void;
  branches: BranchOption[];
  branchId: string;
  onBranchChange: (branchId: string) => void;
  hospitalName?: string;
};

export function StaffScopeBar({
  scopes,
  activeScopeIndex,
  onScopeChange,
  branches,
  branchId,
  onBranchChange,
  hospitalName,
}: Props) {
  const [hospitalMenuOpen, setHospitalMenuOpen] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const activeScope = scopes[activeScopeIndex];
  const activeBranch = branches.find((branch) => branch.id === branchId);

  return (
    <View style={styles.container}>
      {scopes.length > 1 ? (
        <Menu
          visible={hospitalMenuOpen}
          onDismiss={() => setHospitalMenuOpen(false)}
          anchor={
            <Text style={styles.link} onPress={() => setHospitalMenuOpen(true)}>
              {activeScope?.hospitalName ?? hospitalName ?? 'Select hospital'}
            </Text>
          }
        >
          {scopes.map((scope, index) => (
            <Menu.Item
              key={`${scope.hospitalId}-${scope.branchId}`}
              title={scope.hospitalName}
              onPress={() => {
                onScopeChange(index);
                setHospitalMenuOpen(false);
              }}
            />
          ))}
        </Menu>
      ) : (
        <Text style={styles.hospital}>{activeScope?.hospitalName ?? hospitalName ?? 'Hospital'}</Text>
      )}

      {branches.length > 1 ? (
        <Menu
          visible={branchMenuOpen}
          onDismiss={() => setBranchMenuOpen(false)}
          anchor={
            <Text style={styles.link} onPress={() => setBranchMenuOpen(true)}>
              Branch: {activeBranch?.name ?? 'Select branch'}
            </Text>
          }
        >
          {branches.map((branch) => (
            <Menu.Item
              key={branch.id}
              title={branch.name}
              onPress={() => {
                onBranchChange(branch.id);
                setBranchMenuOpen(false);
              }}
            />
          ))}
        </Menu>
      ) : activeBranch ? (
        <Text style={styles.branch}>Branch: {activeBranch.name}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginBottom: layout.stackGap,
    padding: layout.cardPadding,
    backgroundColor: appColors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: appColors.outline,
  },
  hospital: { fontWeight: '700', color: appColors.textPrimary },
  branch: { color: appColors.textSecondary },
  link: { color: appColors.primary, fontWeight: '600' },
});
