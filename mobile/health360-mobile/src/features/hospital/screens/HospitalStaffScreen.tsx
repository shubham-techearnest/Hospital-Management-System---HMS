import { useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  Menu,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { useHospitalProfile, useBranches } from '@/features/hospital/hooks/useHospitalQueries';
import { STAFF_ROLES, type StaffRole } from '@/features/hospital/api/staffApi';
import {
  useDeactivateStaff,
  useInviteStaff,
  useStaffList,
} from '@/features/hospital/hooks/useStaffQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { PhoneField } from '@/shared/phone/PhoneField';
import { isValidE164 } from '@/shared/phone/phoneUtils';
import { appColors, layout } from '@/shared/theme';

export function HospitalStaffScreen() {
  const { data: profile, isLoading: profileLoading } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const hospitalId = profile?.id ?? '';
  const { data: staff = [], isLoading, refetch, isRefetching } = useStaffList(hospitalId);
  const invite = useInviteStaff(hospitalId);
  const deactivate = useDeactivateStaff(hospitalId);
  const primaryBranch = branches.find((b) => b.primary) ?? branches[0];

  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    temporaryPassword: '',
    roleName: 'RECEPTIONIST' as StaffRole,
    jobTitle: '',
  });

  const submitInvite = async () => {
    setPhoneError('');
    if (form.phone.trim() && !isValidE164(form.phone)) {
      setPhoneError('Enter a valid phone number or leave blank.');
      return;
    }
    try {
      await invite.mutateAsync({
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        temporaryPassword: form.temporaryPassword,
        roleName: form.roleName,
        branchId: form.roleName === 'RECEPTIONIST' ? undefined : primaryBranch?.id,
        jobTitle: form.jobTitle.trim() || undefined,
      });
      setInviteOpen(false);
      setForm({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        temporaryPassword: '',
        roleName: 'RECEPTIONIST',
        jobTitle: '',
      });
      setSnack('Staff member invited.');
    } catch (error) {
      setSnack(getApiErrorMessage(error, 'Invite failed'));
    }
  };

  const confirmDeactivate = (staffId: string, name: string) => {
    Alert.alert('Deactivate staff', `Deactivate ${name}? They will lose hospital access.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: () => {
          void deactivate.mutateAsync(staffId)
            .then(() => setSnack('Staff deactivated.'))
            .catch((error: unknown) => setSnack(getApiErrorMessage(error, 'Failed')));
        },
      },
    ]);
  };

  if (profileLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={styles.loader} />
      </ScreenContainer>
    );
  }

  if (!hospitalId) {
    return (
      <ScreenContainer>
        <EmptyState icon="hospital-building" title="Create a hospital profile first" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : staff}
        keyExtractor={(item) => item.staffId}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <ScreenIntro description="Invite reception, nursing, lab, and other operational staff." />
            <Button mode="contained" icon="account-plus" onPress={() => setInviteOpen(true)} style={styles.inviteBtn}>
              Invite staff
            </Button>
            {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
          </View>
        }
        ListEmptyComponent={!isLoading ? <EmptyState icon="account-group" title="No staff yet" /> : null}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.row}>
              <Text variant="titleMedium">
                {item.firstName} {item.lastName}
              </Text>
              <Chip compact>{item.employmentStatus}</Chip>
            </View>
            <Text style={styles.meta}>{item.email}</Text>
            <Text style={styles.meta}>{item.roles.join(', ') || item.jobTitle || 'Staff'}</Text>
            {item.employmentStatus === 'ACTIVE' ? (
              <Button
                mode="text"
                textColor={appColors.error}
                onPress={() => confirmDeactivate(item.staffId, `${item.firstName} ${item.lastName}`)}
              >
                Deactivate
              </Button>
            ) : null}
          </AppCard>
        )}
      />

      <Portal>
        <Dialog visible={inviteOpen} onDismiss={() => setInviteOpen(false)}>
          <Dialog.Title>Invite staff</Dialog.Title>
          <Dialog.ScrollArea>
          <Dialog.Content>
            <TextInput
              label="First name"
              value={form.firstName}
              onChangeText={(firstName) => setForm((f) => ({ ...f, firstName }))}
              style={styles.field}
            />
            <TextInput
              label="Last name"
              value={form.lastName}
              onChangeText={(lastName) => setForm((f) => ({ ...f, lastName }))}
              style={styles.field}
            />
            <TextInput
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(email) => setForm((f) => ({ ...f, email }))}
              style={styles.field}
            />
            <PhoneField
              label="Phone"
              value={form.phone}
              onChange={(phone) => {
                setForm((f) => ({ ...f, phone }));
                setPhoneError('');
              }}
              optional
              error={!!phoneError}
              helperText={phoneError || undefined}
              style={styles.field}
            />
            <TextInput
              label="Temporary password"
              secureTextEntry
              value={form.temporaryPassword}
              onChangeText={(temporaryPassword) => setForm((f) => ({ ...f, temporaryPassword }))}
              style={styles.field}
            />
            <TextInput
              label="Job title (optional)"
              value={form.jobTitle}
              onChangeText={(jobTitle) => setForm((f) => ({ ...f, jobTitle }))}
              style={styles.field}
            />
            <Menu
              visible={roleMenuOpen}
              onDismiss={() => setRoleMenuOpen(false)}
              anchor={
                <Button mode="outlined" onPress={() => setRoleMenuOpen(true)} style={styles.field}>
                  Role: {form.roleName.replace(/_/g, ' ')}
                </Button>
              }
            >
              {STAFF_ROLES.map((role) => (
                <Menu.Item
                  key={role}
                  title={role.replace(/_/g, ' ')}
                  onPress={() => {
                    setForm((f) => ({ ...f, roleName: role }));
                    setRoleMenuOpen(false);
                  }}
                />
              ))}
            </Menu>
          </Dialog.Content>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setInviteOpen(false)}>Cancel</Button>
            <Button
              onPress={() => void submitInvite()}
              loading={invite.isPending}
              disabled={!form.email || !form.firstName || !form.lastName || !form.temporaryPassword}
            >
              Invite
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={3000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: layout.screenPaddingBottom },
  inviteBtn: { marginBottom: layout.stackGap },
  loader: { marginVertical: layout.stackGap },
  card: { marginBottom: layout.stackGap },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  meta: { color: appColors.textSecondary, marginTop: 2 },
  field: { marginBottom: 8 },
});
